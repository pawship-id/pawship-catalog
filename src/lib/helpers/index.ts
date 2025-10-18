// helper cek role
export function isAdmin(role: string) {
  return role === "admin";
}
export function isReseller(role: string) {
  return role === "reseller";
}
export function isRetail(role: string) {
  return role === "retail";
}

/*
  generate slug
  text -> the data that will be converted into a url
  id -> the ID data from the database
*/
export function generateSlug(text: string) {
  if (text.includes("/")) {
    text = text = text.replace(/[^a-zA-Z0-9]/g, "-");
  }

  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().slice(-2);
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 4);

  const id = `${randomChars}${day}${month}${year}${seconds}`;

  return text.toLowerCase().split(" ").join("-") + "-" + id;
}
