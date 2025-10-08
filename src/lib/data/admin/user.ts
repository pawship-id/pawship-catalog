import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";

export async function getUsers() {
  try {
    await dbConnect();

    const users = await User.find({}, "fullName email phoneNumber role deleted")
      .sort("createdAt")
      .lean();

    const formatted = users.map((user: any) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      deleted: user.deleted,
    }));

    return formatted;
  } catch (error) {
    console.log(`Failed to retrieve user data: ${error}`);
    return [];
  }
}
