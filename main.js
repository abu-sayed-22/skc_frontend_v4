/*
 * Title: skc frontend
 * Description: skc crop desis ai via computer vision tehcnology
 * Author: Sayed
 * Date: 21/09/2023
 *
 */

// all rights reseved by abu sayed

const imageSubmitForm = document.querySelector("#image_submit_form");
const inputImage = document.querySelector("#image_input");
const imageName = document.querySelector("#image_name");
const imagePreview = document.querySelector("#image_preview");
const alertContainer = document.querySelector("#alert-container");
const desiesName = document.querySelector("#desies-name");
const desiesSolution = document.querySelector("#desies-solution");
const loader = document.querySelector("#loader");

// showLoader();

// first handle the submit event
imageSubmitForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const imageFile = inputImage.files[0];

  if (!imageFile) {
    showAlert("Please Select An Image", "danger");
    return undefined;
  }
  const imageExtension = imageFile.type.split("/")[1];
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  // checking if image exists

  if (allowedExtensions.includes(imageExtension)) {
    imagePreview.src = URL.createObjectURL(imageFile);
    showLoader();
    // reading image file for converting it into base64 for sending to the server
    const reader = new FileReader();

    reader.onload = function (e) {
      const base64String = e.target.result;
      const modefiedBase64 = base64String.slice(
        base64String.indexOf("base64,") + 7
      );

      const data = {
        image: modefiedBase64,
        apikey: "sayedSKC@386",
      };
      fetch("https://skc-desies-predictor-03.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
          // You can add other headers as needed, e.g., authorization headers
        },
        body: JSON.stringify(data), // Convert the data object to a JSON string
      })
        .then((res) => res.json())
        .then((data) => {
          const pred_class = data.output.pred_class;
          updateaUI(data);
          getSolutionViaChatGpt(pred_class);
          // hideLoader();
        })
        .catch((err) => {
          console.log(err);
          hideLoader();
          showAlert("Error Occured , Please Try Again", "danger");
        });
    };
    reader.readAsDataURL(imageFile);
  } else {
    showAlert("Please Select An Image file", "danger");
  }
});

// handeling the image input
inputImage.addEventListener("change", function (e) {
  const imageFile = inputImage.files[0];
  const imageExtension = imageFile.type.split("/")[1];
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  if (allowedExtensions.includes(imageExtension)) {
    imageName.innerText = imageFile.name;
    imagePreview.src = URL.createObjectURL(imageFile);
  } else {
    showAlert("Please Select An Image file", "danger");
  }
});

function showAlert(text, type) {
  alertContainer.innerHTML = `<div class="alert alert-${type} aler-box my-5 " role="alert">
${text}
</div>
`;
}

function hideAlert() {
  alertContainer.innerHTML = "";
}

function updateaUI(data) {
  // data={
  //   "output": {
  //     "pred_class": "totamto_normal",
  //     "proab_labels": [
  //       "potato_normal",
  //       "potato_late_blight",
  //       "totamto_normal",
  //       "totamto_late_blight"
  //     ],
  //     "proabs": [
  //       0.011214052326977253,
  //       0.2002357691526413,
  //       0.29622504115104675,
  //       0.49232515692710876
  //     ]
  //   }
  // }
  console.log(data);
  console.log(desiesName);
  // desiesName.innerHTML = `${data.oyutput.pred_class} - ${Math.max(
  //   ...data.output.proabs
  // )}`;
  const percentage = Math.max(...data.output.proabs) * 100;
  desiesName.innerHTML =
    data.output.pred_class + "-" + percentage.toFixed(2) + "%";
}

function getSolutionViaChatGpt(desies) {
  const apiKey = "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";
  const endpoint = "https://api.openai.com/v1/chat/completions";

  // User input
  const userMessage = `what is the solutin for this deasies ${desies}`;

  // Send a POST request to the ChatGPT API
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "gpt-3.5-turbo",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Extract the assistant's reply
      const assistantReply = data.choices[0].message.content;
      desiesSolution.innerText = assistantReply;
      hideLoader();
      // Display the assistant's reply
      console.log("Assistant:", assistantReply);
    })
    .catch((error) => {
      hideLoader();
      showAlert("Error in generating solution", "danger");
      console.error("Error:", error);
    });
}

// loader function

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

// @TODO
// 1.Add loader
// 2.Request And Get Result From The Server
