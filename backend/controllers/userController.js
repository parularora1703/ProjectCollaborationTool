import { asyncHandler } from "../middlewares/asyncHandler.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { getCurrentUserService } from "../services/userServices.js";

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.query.userId; 
  // fallback for testing in Thunder Client

  const { user } = await getCurrentUserService(userId);

  return res.status(HTTPSTATUS.OK).json({
    message: "User fetched successfully",
    user,
  });
});
