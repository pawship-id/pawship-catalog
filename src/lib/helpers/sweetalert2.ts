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
