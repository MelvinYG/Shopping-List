import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSetting = {
    databaseURL: "https://shopping-list-7ce9d-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(appSetting);
const database = getDatabase(app);
const shoppingListInDb = ref(database, "shoppingList");

const input = document.getElementById("input-text");
const btn = document.getElementById("input-btn");
const list = document.getElementById("list");

btn.addEventListener('click', () => {
    let inputVal = input.value;
    console.log(inputVal);
    if (inputVal !== "") {
        push(shoppingListInDb, inputVal);
        input.value = "";
    }
});

onValue(shoppingListInDb, (snapshot) => {
    if (snapshot.val()) {
        let itemsArray = Object.entries(snapshot.val());
        list.innerHTML = "";

        for (const item of itemsArray) {
            appendItemToList(item);
        }
    }
});

// Function to add a child element to the list

function appendItemToList(item) {
    const inputVal = item[1];
    const newItem = document.createElement("li");
    newItem.classList.add("list-group-item");
    newItem.textContent = inputVal;

    const newBtn = document.createElement("button");
    newBtn.classList.add("btn", "btn-primary", "rounded-pill", "done-btn");
    newBtn.textContent = "Done";

    newItem.appendChild(newBtn);
    list.appendChild(newItem);
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('done-btn')) {
        console.log("clicked");
        const currEle = event.target;
        const parent = currEle.parentNode;

        parent.style.textDecoration = 'line-through';
        event.target.innerHTML = `<i class="fa-solid fa-trash delete-icon"></i>`;
    }
});

// Delete Item from list and DB

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-icon')) {
        console.log('deleted-icon clicked');
        const listItem = event.target.closest('li');
        const itemVal = listItem.textContent; // Trim whitespace from the text content
        list.removeChild(listItem);

        // Remove the item from Firebase based on its value
        const itemRef = ref(database, 'shoppingList');
        onValue(itemRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Loop through the data to find the matching value
                Object.entries(data).forEach(([key, value]) => {
                    if (value === itemVal) {
                        // Remove the item from Firebase using its key
                        const exactLocationInDb = ref(database, `shoppingList/${key}`);
                        remove(exactLocationInDb);
                    }
                });
            }
        });
    }
});
