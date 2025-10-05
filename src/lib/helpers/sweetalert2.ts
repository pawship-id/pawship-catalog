import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// function to display success alert
export const showSuccessAlert = (
  title: string = "Success",
  message: string | string[]
) => {
  let msg = message;

  if (Array.isArray(message)) {
    msg = message.map((item) => `<span>${item}</span>`).join("<br>");
  }

  MySwal.fire({
    icon: "success",
    title: title,
    html: msg,
    showConfirmButton: false,
    timer: 2000,
  });
};

// function to display error alert
export const showErrorAlert = (
  title: string = "Error",
  message: string | string[]
) => {
  let msg = message;

  if (Array.isArray(message)) {
    msg = message.map((item) => `<span>${item}</span>`).join("<br>");
  }

  MySwal.fire({
    icon: "error",
    title: title,
    html: msg,
    timer: 3000,
  });
};

// function to confirm alert
export const showConfirmAlert = async (
  text: string,
  textConfirmButton: string
) => {
  return await Swal.fire({
    title: "Are you sure?",
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: textConfirmButton,
    cancelButtonText: "Cancel",
  });
};
