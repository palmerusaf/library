let bookList = [];
const form = document.querySelector("form");
const formInputs = [...form.querySelectorAll("input")].filter(
  (input) => input.type !== "submit" && input.type !== "reset"
);
addCustomValidationListenersToFormInputs();

function addCustomValidationListenersToFormInputs() {
  formInputs.forEach((inputField) => {
    inputField.addEventListener("input", () =>
      addCustomErrorMessagesToInputField(inputField)
    );
    inputField.addEventListener("invalid", (e) => e.preventDefault());
  });
}

function addCustomErrorMessagesToInputField(inputField) {
  inputField.reportValidity();
  if (inputField.type === "radio") {
    addCustomMessageRadioButton(inputField);
  } else {
    addCustomMessageToTextField(inputField);
  }

  function addCustomMessageToTextField(inputField) {
    if (inputField.validity.valueMissing) {
      const messageEnding = makeMessageEndingFromFieldLabel(inputField);
      const customErrorMessage = `Please enter the ${messageEnding}`;
      updateErrorDisplayBoxForField(inputField, customErrorMessage);
    } else if (inputField.validity.rangeUnderflow) {
      const inputValue = inputField.value;
      const customErrorMessage = `Your book can not have ${inputValue} pages.`;
      updateErrorDisplayBoxForField(inputField, customErrorMessage);
    } else if (inputField.validity.badInput) {
      updateErrorDisplayBoxForField(inputField, "Please enter a number.");
    } else {
      updateErrorDisplayBoxForField(inputField, "");
    }

    function makeMessageEndingFromFieldLabel(inputField) {
      return inputField.previousElementSibling.textContent
        .toLowerCase()
        .replace(":", ".");
    }
  }

  function addCustomMessageRadioButton(inputField) {
    if (form[3].validity.valueMissing && form[4].validity.valueMissing) {
      updateErrorDisplayBoxForField(
        inputField,
        "Please indicate if you have read this book entry or not."
      );
    } else updateErrorDisplayBoxForField(inputField, "");
  }

  function updateErrorDisplayBoxForField(inputField, customErrorMessage) {
    const errorDisplayBox = inputField.parentNode.nextElementSibling;
    errorDisplayBox.textContent = customErrorMessage;
  }
}

const navButtons = document.querySelectorAll(".header__nav-item");
addEventsListenersToNavButtons(navButtons);

function addEventsListenersToNavButtons(navButtons) {
  navButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      displayPageContent(e);
      setNavButtonToActive(e);
    });
  });

  function setNavButtonToActive(clickEvent) {
    const button = clickEvent.target;
    removeActiveClassFromAllButtons();
    addActiveClassToButton(button);

    function removeActiveClassFromAllButtons() {
      navButtons.forEach((button) =>
        button.classList.remove("header__nav-item--active")
      );
    }

    function addActiveClassToButton(button) {
      button.classList.add("header__nav-item--active");
    }
  }

  function displayPageContent(clickEvent) {
    const contentElements = [...document.querySelectorAll(".content")];
    const contentToDisplay = findContentFromClick(clickEvent);

    hideAllContent();
    contentToDisplay.classList.remove("hide-me");

    function findContentFromClick(clickEvent) {
      const matchingIndex = clickEvent.target.dataset.index;
      const contentToDisplay = contentElements.find(
        (element) => element.dataset.index === matchingIndex
      );
      return contentToDisplay;
    }

    function hideAllContent() {
      contentElements.forEach((element) => element.classList.add("hide-me"));
    }
  }
}

const submitButton = document.getElementsByClassName("form__btn--submit")[0];
submitButton.addEventListener("click", handleSubmitClick);

function handleSubmitClick(clickEvent) {
  clickEvent.preventDefault();

  if (form.reportValidity()) {
    appendBookListUsingForm(form);
    updateBookListDisplay();
    saveBookListToLocalStorage();
    form.reset();
    moveCursorToTopOfForm();
  } else {
    fireCustomErrorMessagesOnAllInputElements();
  }

  function moveCursorToTopOfForm() {
    document.getElementById("author-name").focus();
  }

  function fireCustomErrorMessagesOnAllInputElements() {
    formInputs.forEach((inputField) =>
      addCustomErrorMessagesToInputField(inputField)
    );
  }
}

function appendBookListUsingForm(form) {
  const author = form[0].value;
  const title = form[1].value;
  const pages = form[2].value;
  const read = form[3].checked;
  bookList.push(new Book(author, title, pages, read));
}

class Book {
  constructor(author, title, pages, read) {
    this.author = author;
    this.title = title;
    this.pages = pages;
    this.read = read;
  }
}

function updateBookListDisplay() {
  clearBookListDisplay();
  displayBookList();
}

function clearBookListDisplay() {
  const tableBody = document.querySelector("tbody");
  tableBody.innerText = "";
}

function displayBookList() {
  const table = document.querySelector("tbody");
  table.appendChild(makeTableRowsFromBookList());

  function makeTableRowsFromBookList() {
    const tableRows = document.createDocumentFragment();
    bookList.forEach((bookEntry, index) => {
      tableRows.appendChild(makeRowFromEntry(bookEntry, index));
    });
    return tableRows;

    function makeRowFromEntry(bookEntry, index) {
      const rowContainer = makeRowContainer(index);
      rowContainer.appendChild(makeRowItem(bookEntry.author));
      rowContainer.appendChild(makeRowItem(bookEntry.title));
      rowContainer.appendChild(makeRowItem(bookEntry.pages));
      rowContainer.appendChild(makeReadCheckBox(bookEntry.read));
      rowContainer.appendChild(makeDeleteEntryButton());
      return rowContainer;

      function makeRowContainer(index) {
        const rowContainer = document.createElement("tr");
        rowContainer.classList = "flex table__row";
        if (index % 2 !== 0) rowContainer.classList.add("table__row--even");
        rowContainer.dataset.indexNumber = index;
        return rowContainer;
      }

      function makeRowItem(content) {
        const rowItem = document.createElement("td");
        rowItem.classList = "table__item";
        rowItem.textContent = content;
        return rowItem;
      }

      function makeReadCheckBox(isRead) {
        const checkBoxLabel = document.createElement("label");
        checkBoxLabel.textContent = "Read";

        const checkBox = makeCheckBox(isRead);
        checkBoxLabel.appendChild(checkBox);

        const rowItemContainer = makeRowItem("");
        rowItemContainer.appendChild(checkBoxLabel);
        return rowItemContainer;

        function makeCheckBox(isRead) {
          const checkBox = document.createElement("input");
          checkBox.type = "checkbox";
          checkBox.checked = isRead;
          checkBox.addEventListener("input", (event) => {
            updateBookListEntryIsReadStatus(event);
            saveBookListToLocalStorage();
          });
          return checkBox;

          function updateBookListEntryIsReadStatus(event) {
            const index =
              event.target.parentNode.parentNode.parentNode.dataset.indexNumber;
            bookList[index].read = event.target.checked;
          }
        }
      }

      function makeDeleteEntryButton() {
        const deleteEntryButton = document.createElement("button");
        deleteEntryButton.classList =
          "form__btn form__btn--reset form__btn--del";
        deleteEntryButton.textContent = "delete";
        deleteEntryButton.addEventListener("click", deleteBookEntry);
        return deleteEntryButton;

        function deleteBookEntry(e) {
          const rowIndex = e.target.parentNode.dataset.indexNumber;
          bookList.splice(rowIndex, 1);
          updateBookListDisplay();
          saveBookListToLocalStorage();
        }
      }
    }
  }
}

function saveBookListToLocalStorage() {
  localStorage.setItem("myReadingListLocal", JSON.stringify(bookList));
}

function getBookListFromLocalStorage() {
  bookList = JSON.parse(localStorage.getItem("myReadingListLocal") || "[]");
  updateBookListDisplay();
}

getBookListFromLocalStorage();
