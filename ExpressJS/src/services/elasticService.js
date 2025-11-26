const { Client } = require("@elastic/elasticsearch");

// 1. Khởi tạo Client
const client = new Client({
  node: "http://localhost:9200",
});

const INDEX_NAME = "chat_histories";

/**
 * Hàm tạo Index (Schema)
 * Cần chạy hàm này 1 lần (hoặc xóa index cũ đi tạo lại) để cập nhật trường 'content'
 */
const initIndex = async () => {
  try {
    const indexExists = await client.indices.exists({ index: INDEX_NAME });
    if (!indexExists) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: "integer" },
              userId: { type: "integer" },
              title: { type: "text" },

              content: { type: "text" },

              lastMessageAt: { type: "date" },
              createdAt: { type: "date" },
            },
          },
        },
      });
      console.log(`✅ Đã tạo Index Elasticsearch: ${INDEX_NAME}`);
    }
  } catch (error) {
    console.error("❌ Lỗi tạo Index ES:", error);
  }
};

/**
 * Hàm đẩy dữ liệu vào ES (Sync)
 */
const indexChatData = async (chatData) => {
  try {
    await client.index({
      index: INDEX_NAME,
      id: chatData.id.toString(),
      body: {
        id: chatData.id,
        userId: chatData.userId,
        title: chatData.title,

        content: chatData.content || "",

        lastMessageAt: chatData.lastMessageAt,
        createdAt: chatData.createdAt,
      },
      refresh: true,
    });
  } catch (error) {
    console.error("❌ Lỗi sync ES:", error);
  }
};

/**
 * Hàm tìm kiếm chính (Search & Filter & Sort)
 * @param userId
 * @param keyword
 * @param startDate
 * @param endDate
 * @param page
 * @param limit
 * @param {string} sort - 'newest' (mặc định) hoặc 'oldest'
 */
const searchChatsInES = async (
  userId,
  keyword,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  sort = "newest",
) => {
  const from = (page - 1) * limit;

  // 1. Base Query: Bắt buộc phải đúng User ID
  const boolQuery = {
    must: [{ term: { userId: userId } }],
    filter: [],
  };

  // 2. Xử lý tìm kiếm từ khóa (Keyword)
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    boolQuery.must.push({
      bool: {
        should: [
          {
            wildcard: {
              title: { value: `*${lowerKeyword}*`, boost: 3 },
            },
          },
          {
            match: {
              title: { query: keyword, fuzziness: "AUTO", boost: 2 },
            },
          },

          {
            wildcard: {
              content: { value: `*${lowerKeyword}*` },
            },
          },
          {
            match: {
              content: { query: keyword, fuzziness: "AUTO" },
            },
          },
        ],
        minimum_should_match: 1,
      },
    });
  }

  // 3. Xử lý lọc theo ngày (Date Range)
  if (startDate || endDate) {
    const rangeConfig = { lastMessageAt: {} };
    if (startDate) rangeConfig.lastMessageAt.gte = startDate;
    if (endDate) rangeConfig.lastMessageAt.lte = endDate;
    boolQuery.filter.push({ range: rangeConfig });
  }

  // 4. Xử lý sắp xếp (Sort)
  let sortConfig = [{ lastMessageAt: { order: "desc" } }]; // Default: Mới nhất
  if (sort === "oldest") {
    sortConfig = [{ lastMessageAt: { order: "asc" } }]; // Cũ nhất
  }

  // 5. Thực thi Search
  try {
    const result = await client.search({
      index: INDEX_NAME,
      from: from,
      size: limit,
      body: {
        query: { bool: boolQuery },
        sort: sortConfig,
      },
    });

    const total = result.hits.total.value;
    const hits = result.hits.hits.map((hit) => hit._source);

    return { total, hits };
  } catch (error) {
    console.error("Lỗi query ES:", error);
    return { total: 0, hits: [] };
  }
};

module.exports = { initIndex, indexChatData, searchChatsInES };
