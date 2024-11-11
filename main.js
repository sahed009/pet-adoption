let petsData = [];
let likedPets = [];

// Fetch all pets
async function fetchAllPets() {
  const petsContainer = document.getElementById("pets-container");
  const spinner = document.getElementById("spinner");

  // Show spinner
  petsContainer.classList.add("hidden");
  spinner.classList.remove("hidden");

  try {
    const response = await fetch(
      "https://openapi.programming-hero.com/api/peddy/pets"
    );
    const data = await response.json();
    petsData = data.pets;

    setTimeout(() => {
      spinner.classList.add("hidden");
      petsContainer.classList.remove("hidden");
      renderPets(petsData);
    }, 2000);
  } catch {
    showError("Failed to load pets.");
  }
}

// Fetch categories
async function fetchCategories() {
  try {
    const response = await fetch(
      "https://openapi.programming-hero.com/api/peddy/categories"
    );
    const data = await response.json();
    if (data && data.categories) {
      renderCategoryButtons(data.categories);
    } else {
      showError("Failed to load categories.");
    }
  } catch {
    showError("Failed to load categories.");
  }
}

// Fetch a specific category 
async function fetchCategory(categoryName) {
  const petsContainer = document.getElementById("pets-container");
  const spinner = document.getElementById("spinner");
  const noDataContainer = document.getElementById("no-data-container");

  noDataContainer.classList.add("hidden");


  petsContainer.classList.add("hidden");
  spinner.classList.remove("hidden");


  const minimumSpinnerTime = new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );

  try {
    const fetchData = fetch(
      `https://openapi.programming-hero.com/api/peddy/category/${categoryName}`
    ).then((response) => response.json());


    const [result] = await Promise.all([fetchData, minimumSpinnerTime]);

    spinner.classList.add("hidden");

    if (result && Array.isArray(result.data)) {
      petsData = result.data;

      if (petsData.length > 0) {
        petsContainer.classList.remove("hidden");
        renderPets(petsData);
      } else {
        noDataContainer.classList.remove("hidden");
        petsContainer.classList.add("hidden");
      }
    } else {
      noDataContainer.classList.remove("hidden");
    }
  } catch {
    showError("Failed to load category pets.");
    spinner.classList.add("hidden");
  }
}

// Render category buttons
function renderCategoryButtons(categories) {
  const categoryContainer = document.getElementById("category-buttons");
  categoryContainer.innerHTML = "";

  categories.forEach((category) => {
    if (category.category && category.category_icon) {
      const categoryButton = document.createElement("button");

      categoryButton.classList.add(
        "flex",
        "items-center",
        "justify-center",
        "mx-auto",
        "px-4",
        "py-4",
        "w-2/3",
        "gap-3",
        "border",
        "border-gray-300",
        "rounded-lg",
        "bg-white",
        "transition-all",
        "duration-300",
        "font-bold",
        "text-2xl",
        "text-[#131313]"
      );

      categoryButton.innerHTML = `
        <img src="${category.category_icon}" alt="${category.category}" class="w-8 h-8">
        <span>${category.category}s</span>
      `;

      categoryButton.addEventListener("click", () => {
        fetchCategory(category.category.toLowerCase());
        setActiveButton(categoryButton);
      });

      categoryContainer.appendChild(categoryButton);
    }
  });
}

// Set the active button
let activeCategory = "";
function setActiveButton(button) {
  if (activeCategory) {
    activeCategory.classList.remove(
      "bg-[#E7F2F2]",
      "border-[#0E7A81]",
      "rounded-full"
    );
    activeCategory.classList.add("bg-white", "border-gray-300", "rounded-lg");
  }

  button.classList.remove("bg-white", "border-gray-300", "rounded-lg");
  button.classList.add("bg-[#E7F2F2]", "border-[#0E7A81]", "rounded-full");
  activeCategory = button;
}

// Sort by price
function sortByPrice() {
  const sortedPets = [...petsData].sort((a, b) => b.price - a.price);
  renderPets(sortedPets);
}

// Render pets
function renderPets(pets) {
  const petsContainer = document.getElementById("pets-container");
  petsContainer.innerHTML = "";

  pets.forEach((pet) => {
    if (pet.petId) {
      const petCard = `
        <div class="card p-4 rounded shadow">
          <img src="${pet.image}" alt="${
        pet.pet_name
      }" class="w-full h-48 object-cover rounded">

          <h3 class="text-xl font-inter font-bold mt-2">${
            pet.pet_name ?? "Unknown"
          }</h3>

          <p class="flex items-center gap-3"><i class="fa-solid fa-boxes-stacked" style="color: #5a5a5a;"></i> Breed: ${
            pet.breed ?? "Unknown"
          }</p>

          <p class="flex items-center gap-3"><i class="fa-regular fa-calendar" style="color: #5a5a5a;"></i> Birth Date: ${
            pet.date_of_birth ?? "Unknown"
          }</p>

          <p class="flex items-center gap-3"><i class="fa-solid fa-mercury" style="color: #5a5a5a;"></i> Gender: ${
            pet.gender ?? "Unknown"
          }</p>

          <p class="flex items-center gap-3"><i class="fa-solid fa-dollar-sign" style="color: #5a5a5a;"></i> Price: $${
            pet.price ?? "N/A"
          }</p>

          <hr class="border-t border-[#E7E7E7] my-2" />
          <div class="flex space-x-2 mt-2">
            <button class="px-4 py-2 border border-[#DBEBEC] rounded-lg" onclick="likePet('${
              pet.image
            }')">
              <i class="fa-regular fa-thumbs-up fa-lg" style="color: #717171;"></i>
            </button>
            <button class="px-4 py-2 border border-[#DBEBEC] rounded-lg text-xl font-bold text-[#0E7A81]" id="adopt-btn-${
              pet.petId
            }" onclick="adoptPet('${pet.petId}')">Adopt</button>
            <button class="px-4 py-2 border border-[#DBEBEC] rounded-lg text-xl font-bold text-[#0E7A81]" onclick="showDetails('${
              pet.petId
            }')">Details</button>
          </div>
        </div>
      `;
      petsContainer.innerHTML += petCard;
    }
  });
}

// Details modal
async function showDetails(petId) {
  if (!petId) {
    return;
  }

  try {
    const response = await fetch(
      `https://openapi.programming-hero.com/api/peddy/pet/${petId}`
    );
    const data = await response.json();

    const pet = data.petData;

    if (!pet) {
      return;
    }

    document.getElementById("modal-pet-name").innerText =
      pet.pet_name || "Unknown";
    document.getElementById("modal-pet-breed").innerText = `Breed: ${
      pet.breed || "Unknown"
    }`;
    document.getElementById("modal-pet-age").innerText = `Birth: ${
      new Date(pet.date_of_birth).getFullYear() || "Unknown"
    }`;
    document.getElementById("modal-pet-gender").innerText = `Gender: ${
      pet.gender || "Unknown"
    }`;
    document.getElementById(
      "modal-pet-vaccinated"
    ).innerText = `Vaccinated Status: ${pet.vaccinated_status || "Unknown"}`;
    document.getElementById("modal-pet-price").innerText = `Price: $${
      pet.price || "N/A"
    }`;
    document.getElementById("modal-pet-description").innerText =
      pet.pet_details || "No details available.";
    document.getElementById("modal-pet-image").src = pet.image || "";

    document.getElementById("details-modal").classList.remove("hidden");
  } catch {
    showError("Failed to fetch pet details.");
  }
}

// Close the details modal
function closeModal() {
  document.getElementById("details-modal").classList.add("hidden");
}

// Update the sidebar
function likePet(image) {
  likedPets.push(image);
  updateLikedSidebar();
}

// Update liked pets in the sidebar
function updateLikedSidebar() {
  const likedPetsContainer = document.getElementById("liked-pets");
  likedPetsContainer.innerHTML = "";
  likedPets.forEach((image) => {
    likedPetsContainer.innerHTML += `<img src="${image}" alt="Liked pet" class="w-full  object-cover rounded-md">`;
  });
}

// Adopt Modal
function adoptPet(id) {
  let countdown = 3;
  const adoptModal = document.getElementById("adopt-modal");
  const countdownElement = document.getElementById("countdown");
  const adoptButton = document.getElementById(`adopt-btn-${id}`);

  adoptModal.classList.remove("hidden");

  if (adoptButton) {
    adoptButton.disabled = true;
    adoptButton.innerText = "Adopting...";
    adoptButton.classList.add(
      "bg-gray-200",
      "text-gray-500",
      "cursor-not-allowed"
    );
  }

  const intervalId = setInterval(() => {
    countdownElement.innerText = countdown;
    countdown--;

    if (countdown < 0) {
      clearInterval(intervalId);
      adoptModal.classList.add("hidden");

      if (adoptButton) {
        adoptButton.innerText = "Adopted!";
        adoptButton.classList.remove("bg-gray-200", "text-gray-500");
        adoptButton.classList.add("bg-gray-400", "text-gray-600");
      }
    }
  }, 1000);
}



// Smooth scroll to a specified section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: "smooth" });
}

// Initialize the application
function init() {
  fetchAllPets();
  fetchCategories();
}

document.addEventListener("DOMContentLoaded", init);
