const ChatHistory = require("../models/chatHistory");
const Message = require("../models/message");
const { searchChatsInES, indexChatData } = require("./elasticService");

/**
 * Lấy lịch sử chat của một người dùng cụ thể, có phân trang.
 * Đây là API phục vụ cho Lazy Loading/Infinite Scroll.
 * @param {number} userId - ID của người dùng đã xác thực.
 * @param {number} page - Số trang hiện tại.
 * @param {number} limit - Số lượng mục trên mỗi trang.
 */
const getChatHistoriesService = async (userId, page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: chatHistories } = await ChatHistory.findAndCountAll({
      where: { userId: userId },
      limit: limit,
      offset: offset,
      order: [["lastMessageAt", "DESC"]],
      attributes: ["id", "title", "lastMessageAt", "createdAt"],
    });

    return {
      EC: 0,
      EM: "Lấy lịch sử chat thành công",
      DT: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        chatHistories: chatHistories,
      },
    };
  } catch (error) {
    console.log("Lỗi khi lấy lịch sử chat:", error);
    return { EC: -1, EM: "Lỗi server nội bộ", DT: error };
  }
};

/**
 * Lấy chi tiết một cuộc hội thoại, bao gồm tất cả tin nhắn.
 * @param {number} chatHistoryId - ID của cuộc hội thoại.
 * @param {number} userId - ID của người dùng đã xác thực (để đảm bảo bảo mật).
 */
const getChatDetailService = async (chatHistoryId, userId) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      where: {
        id: chatHistoryId,
        userId: userId, // Đảm bảo người dùng chỉ xem được lịch sử của CHÍNH MÌNH
      },
      include: [
        {
          model: Message,
          as: "messages",
          // Sắp xếp tin nhắn theo thời gian tạo (cũ nhất lên trước)
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!chatHistory) {
      return {
        EC: 1,
        EM: "Cuộc hội thoại không tồn tại hoặc bạn không có quyền truy cập.",
      };
    }

    return {
      EC: 0,
      EM: "Lấy chi tiết chat thành công",
      DT: chatHistory,
    };
  } catch (error) {
    console.log("Lỗi khi lấy chi tiết chat:", error);
    return { EC: -1, EM: "Lỗi server nội bộ", DT: error };
  }
};

const searchChatService = async (userId, params) => {
  try {
    const { keyword, startDate, endDate, page, limit } = params;

    // Gọi sang Elasticsearch
    const esResult = await searchChatsInES(
      userId,
      keyword,
      startDate,
      endDate,
      page,
      limit,
    );

    return {
      EC: 0,
      EM: "Tìm kiếm thành công",
      DT: {
        totalItems: esResult.total,
        totalPages: Math.ceil(esResult.total / limit),
        currentPage: page,
        chatHistories: esResult.hits, // Dữ liệu trả về từ ES
      },
    };
  } catch (error) {
    console.log("Lỗi search ES:", error);
    // Fallback: Nếu ES chết, có thể gọi lại getChatHistoriesService của MySQL để chữa cháy
    return { EC: -1, EM: "Lỗi tìm kiếm", DT: error };
  }
};

const createNewChatService = async (userId, payload) => {
  try {
    const { title, firstMessage } = payload;

    // A. Lưu vào MySQL (Source of Truth)
    const newChat = await ChatHistory.create({
      userId: userId,
      title: title || "New Conversation", // Default title nếu không có
      lastMessageAt: new Date(),
    });

    // Nếu có tin nhắn mở đầu thì lưu luôn
    if (firstMessage) {
      await Message.create({
        chatHistoryId: newChat.id,
        content: firstMessage,
        sender: "User",
      });
    }

    // B. ==> ĐỒNG BỘ SANG ELASTICSEARCH <==
    // Bọc try-catch riêng để nếu ES lỗi thì App vẫn chạy bình thường (chỉ là không search được ngay cái này thôi)
    try {
      await indexChatData({
        id: newChat.id,
        userId: newChat.userId,
        title: newChat.title,
        lastMessageAt: newChat.lastMessageAt,
        createdAt: newChat.createdAt,
      });
    } catch (esError) {
      console.error("⚠️ Cảnh báo: Lỗi đồng bộ sang ES:", esError.message);
    }

    return {
      EC: 0,
      EM: "Tạo cuộc hội thoại thành công",
      DT: newChat,
    };
  } catch (error) {
    console.log("Lỗi tạo chat:", error);
    return { EC: -1, EM: "Lỗi server nội bộ", DT: error };
  }
};

module.exports = {
  getChatHistoriesService,
  getChatDetailService,
  searchChatService,
  createNewChatService,
};
