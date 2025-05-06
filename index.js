// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-MATTHEW"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];
const formState = {
  name: "",
  description: "",
  date: "",
  location: "",
};

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// Adds a new party
async function addParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      body: JSON.stringify(party),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });
    await getParties();
    render();
  } catch (error) {
    console.error(error);
  }
}

async function removeParty(id) {
  try {
    const response = await fetch(`${API}/events/${id}`, { method: "DELETE" });
    selectedParty = null;
    await getParties();
  } catch (error) {}
}
// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button>Remove Party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  const $button = $party.querySelector("button");
  $button.addEventListener("click", () => removeParty(selectedParty.id));

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
    Name
    <input name="name" required />
    </label>
    <label>
    Description
    <textarea name="description" rows="5" cols="40">
    Enter the description...
    </textarea>
    </label>
    <label>
    Date
    <input type="date" name="date" required />
    </label>
    <label>
    Location
    <input name="location" required />
    </label>
    <button>Create Party</button>
  `;
  // todo: add event listener
  const nameInput = $form.querySelector('input[name="name"]');
  nameInput.addEventListener("change", function (e) {
    formState.name = e.target.value;
  });
  const descriptionInput = $form.querySelector('textarea[name="description"]');
  descriptionInput.addEventListener("change", function (e) {
    formState.description = e.target.value;
  });
  const dateInput = $form.querySelector('input[name="date"]');
  dateInput.addEventListener("change", function (e) {
    formState.date = new Date(e.target.value).toISOString();
  });
  const locationInput = $form.querySelector('input[name="location"]');
  locationInput.addEventListener("change", function (e) {
    formState.location = e.target.value;
  });
  $form.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
      await addParty(formState);
    } catch (error) {
      console.error(error);
    }
  });
  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h3>Create a new party</h3>
        <NewPartyForm></NewPartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
