const {
  getChatHistoriesService,
  getChatDetailService,
  searchChatService,
  createNewChatService,
} = require("../services/chatService");

/**
 * Xử lý yêu cầu lấy lịch sử chat (GET /api/chat-histories)
 */
const getChatHistories = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Lấy các tham số tìm kiếm
  const { keyword, startDate, endDate } = req.query;

  // K logic: Nếu có keyword HOẶC có chọn ngày -> Gọi hàm Search (Elasticsearch)
  if (keyword || startDate || endDate) {
    const data = await searchChatService(userId, {
      keyword,
      startDate,
      endDate,
      page,
      limit,
    });
    return res.status(200).json(data);
  }

  // Nếu không search gì cả -> Gọi hàm lấy danh sách thường (MySQL)
  const data = await getChatHistoriesService(userId, page, limit);
  return res.status(200).json(data);
};

/**
 * Xử lý yêu cầu lấy chi tiết cuộc hội thoại (GET /api/chat-histories/:chatHistoryId)
 */
const getChatDetail = async (req, res) => {
  const userId = req.user.id;
  const chatHistoryId = req.params.chatHistoryId;

  if (!chatHistoryId) {
    return res.status(400).json({ EC: 1, EM: "Thiếu ID cuộc hội thoại." });
  }

  const data = await getChatDetailService(chatHistoryId, userId);

  if (data.EC === 1) {
    return res.status(404).json(data);
  }

  return res.status(200).json(data);
};

/**
 * Tạo đoạn chat (POST /api/chat-histories)
 */
const createNewChat = async (req, res) => {
  const userId = req.user.id;
  const { title, firstMessage } = req.body;

  // Validate cơ bản
  if (!title && !firstMessage) {
    return res.status(400).json({
      EC: 1,
      EM: "Vui lòng nhập tiêu đề hoặc tin nhắn đầu tiên",
    });
  }

  const data = await createNewChatService(userId, { title, firstMessage });

  return res.status(200).json(data);
};

module.exports = {
  getChatHistories,
  getChatDetail,
  createNewChat,
};
