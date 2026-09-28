
const units = {
    length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Mile: 1609.344
    },

    weight: {
        Kilogram: 1,
        Gram: 0.001,
        Pound: 0.45359237,
        Ounce: 0.0283495
    },

    temperature: {
        Celsius: "C",
        Fahrenheit: "F",
        Kelvin: "K"
    },

    currency: {
        INR: 1,
        USD: 0.012,
        EUR: 0.0103,
        GBP: 0.0088
    }
};

let currentType = "length";

const amountInput = document.getElementById("amount");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const result = document.getElementById("result");
const resultDescription =
    document.getElementById("resultDescription");
const cacheStatus = document.getElementById("cacheStatus");

const CACHE_KEY = "converterCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Read cached results from browser storage
function getCache() {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
}

// Save results to browser storage
function saveCache(cache) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// Remove expired cache entries
function cleanCache(cache) {
    const now = Date.now();

    for (const key in cache) {
        if (now - cache[key].timestamp > CACHE_DURATION) {
            delete cache[key];
        }
    }

    return cache;
}

// Populate unit dropdowns
function populateUnits() {
    const availableUnits = Object.keys(units[currentType]);

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    availableUnits.forEach(unit => {
        fromUnit.add(new Option(unit, unit));
        toUnit.add(new Option(unit, unit));
    });

    if (availableUnits.length > 1) {
        toUnit.selectedIndex = 1;
    }

    convert();
}

// Temperature conversion
function convertTemperature(value, from, to) {
    let celsius;

    if (from === "Celsius") {
        celsius = value;
    } else if (from === "Fahrenheit") {
        celsius = (value - 32) * 5 / 9;
    } else {
        celsius = value - 273.15;
    }

    if (to === "Celsius") {
        return celsius;
    }

    if (to === "Fahrenheit") {
        return (celsius * 9 / 5) + 32;
    }

    return celsius + 273.15;
}

// Main conversion function
function convert() {
    const amount = Number(amountInput.value);
    const from = fromUnit.value;
    const to = toUnit.value;

    if (amountInput.value.trim() === "" || !Number.isFinite(amount)) {
        result.textContent = "Enter a valid amount";
        resultDescription.textContent = "";
        cacheStatus.textContent = "Waiting for valid input";
        return;
    }

    const cache = cleanCache(getCache());

    const cacheKey = JSON.stringify([
        currentType,
        amount,
        from,
        to
    ]);

    // Check whether the result already exists
    if (cache[cacheKey]) {
        result.textContent =
            Number(cache[cacheKey].value).toLocaleString(
                "en-US",
                { maximumFractionDigits: 8 }
            );

        cacheStatus.textContent =
            "⚡ Result loaded from client-side cache";

        resultDescription.textContent =
            `${amount} ${from} = ${result.textContent} ${to}`;

        saveCache(cache);
        return;
    }

    let convertedValue;

    if (currentType === "temperature") {
        convertedValue = convertTemperature(amount, from, to);
    } else {
        const baseValue = amount * units[currentType][from];

        convertedValue =
            baseValue / units[currentType][to];
    }

    cache[cacheKey] = {
        value: convertedValue,
        timestamp: Date.now()
    };

    saveCache(cache);

    result.textContent =
        convertedValue.toLocaleString(
            "en-US",
            { maximumFractionDigits: 8 }
        );

    resultDescription.textContent =
        `${amount} ${from} = ${result.textContent} ${to}`;

    cacheStatus.textContent =
        "✓ New result calculated and saved to cache";
}

// Switch conversion category
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {

        document.querySelectorAll(".tab").forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        currentType = tab.dataset.type;

        populateUnits();
    });
});

// Convert button
document.getElementById("convertBtn")
    .addEventListener("click", convert);

// Swap units
document.getElementById("swapBtn")
    .addEventListener("click", () => {

        const previousFrom = fromUnit.value;

        fromUnit.value = toUnit.value;
        toUnit.value = previousFrom;

        convert();
    });

// Recalculate when values change
amountInput.addEventListener("input", convert);
fromUnit.addEventListener("change", convert);
toUnit.addEventListener("change", convert);

// Initialize application
populateUnits();