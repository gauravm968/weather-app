                                    //fetch by custom attribute
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const apiErrorImg  = document.querySelector("[data-notfoundimg]")
const apiErrorMessage = document.querySelector("[data-apierrortext]")
const apiErrorContainer = document.querySelector(".api-error-container")
const messageText = document.querySelector("[data-messageText]");


//initially vairables need????

let oldTab = userTab;      // currentTab
const API_KEY = "1f6649594ca2f8abafda89c7b32ffeec";
oldTab.classList.add("current-tab");
getfromSessionStorage();


function switchTab(newTab) {     //clickedTab
    apiErrorContainer.classList.remove("active")
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
           //here check search form container is invisible if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
             //in this visible weather tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
          //now u are in weather tab then should be display weather so let's check local storage first 
            //for coordinates if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

function showError(err) {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case err.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case err.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case err.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
  }

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //if not get local coordinates 
        grantAccessContainer.classList.add("active");
    }
    else {
        //convert json string to json object
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

// Api call in this function so make async function
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;       // coordinates of latitude and longitude
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          //check(browser) -->  
        // https://api.openweathermap.org/data/2.5/weather?lat=14.33&lon=17.66&appid=d1845658f92b31c64bd94f06f7188c9c&units=metric

        //convert response(that come from API) into json format
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${err?.message}`;
        // apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);

    }

}

//fetch values from weatherInfo object
function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fetch the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

        
// learn optional chaining operator (?.) -->
// that makes easier safely access nested properties 
// like: in multiple levels nested json object any particular property access 
// if property doestn't exist in json object(or nested) then return undefined without any Error

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    //check  ->    https://flagcdn.com/144x108/td.png  
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    // check ->    http://openweathermap.org/img/w/04d.png
    temp.innerText = `${weatherInfo?.main?.temp} °C `;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //alert for no geolocation support available
        grantAccessButton.style.display = "none";
        messageText.textContent = "GeoLocation Not Found"    
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

//Api call in this function so make async function
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    apiErrorContainer.classList.remove("active")

    try {
         //check(browser) -->   
        // https://api.openweathermap.org/data/2.5/weather?q=delhi&appid=d1845658f92b31c64bd94f06f7188c9c&units=metric
        
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
          
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = `${err?.message}`;
       
        
    }

}
