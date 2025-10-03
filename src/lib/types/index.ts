export type ActionResult = {
  status: "success" | "error" | "";
  message: string | string[];
  data?: any;
};
