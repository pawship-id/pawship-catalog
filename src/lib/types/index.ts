export type ActionResult = {
  status: "success" | "error" | "";
  message: string | string[];
  formData?: any; // input form
  data?: any; // response data
};
