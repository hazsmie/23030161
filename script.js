// Global variables to manage state
let currentRecordIndex = 0;
let studentData = [];
const pageSize = 5;

// Updated loadXMLData to ensure filter options are populated after data load
function loadXMLData() {
    return fetch('students.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const students = data.querySelectorAll('Student');
            studentData = Array.from(students).map(student => {
                return {
                    matricNo: student.querySelector('MatricNo').textContent,
                    firstName: student.querySelector('FirstName').textContent,
                    lastName: student.querySelector('LastName').textContent,
                    contactNo: student.querySelector('ContactNo').textContent,
                    email: student.querySelector('Email').textContent,
                    city: student.querySelector('City').textContent,
                    state: student.querySelector('State').textContent,
                    postcode: student.querySelector('Postcode').textContent
                };
            });
            updateDisplay();
            populateFilterOptions(studentData); 
        })
        .catch(error => {
            console.error('Error loading XML data:', error);
        });
}

function updateDisplay() {
    displayCurrentSet();
}

function displayCurrentSet(filteredData = studentData) {
    const endRecordIndex = Math.min(currentRecordIndex + pageSize, filteredData.length);
    const currentSet = filteredData.slice(currentRecordIndex, endRecordIndex);

    const basicInfoContainer = document.getElementById('student-basic-container');
    basicInfoContainer.innerHTML = currentSet.map(student =>
        `<div><strong>${student.matricNo}</strong> - ${student.firstName} ${student.lastName}</div>`
    ).join('');

    // Adjust navigation buttons for filtered data
    document.getElementById('prev-btn').disabled = currentRecordIndex === 0;
    document.getElementById('next-btn').disabled = endRecordIndex >= filteredData.length;

        // Additionally, control the visibility of navigation buttons based on the view mode
        document.getElementById('prev-btn').style.display = basicInfoContainer.classList.contains('hidden') ? 'none' : 'inline-block';
        document.getElementById('next-btn').style.display = basicInfoContainer.classList.contains('hidden') ? 'none' : 'inline-block';
}

function setupNavigationButtons() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');

    prevButton.addEventListener('click', () => {
        currentRecordIndex = Math.max(0, currentRecordIndex - pageSize);
        displayCurrentSet();
    });

    nextButton.addEventListener('click', () => {
        currentRecordIndex = Math.min(studentData.length - pageSize, currentRecordIndex + pageSize);
        displayCurrentSet();
    });
}

function setupViewAllButton() {
    const viewAllButton = document.getElementById('view-all-btn');
    const filters = document.querySelectorAll('.filter'); // Assuming you've added this class to your filter elements

    viewAllButton.addEventListener('click', function() {
        const allRecordsSection = document.getElementById('all-records');
        const basicInfoSection = document.getElementById('basic-info');
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');

        // Toggle between showing all records and basic info
        if (allRecordsSection.classList.contains('hidden')) {
            allRecordsSection.classList.remove('hidden');
            basicInfoSection.classList.add('hidden');
            prevButton.style.display = 'none'; // Hide navigation buttons
            nextButton.style.display = 'none';
            filters.forEach(filter => filter.style.display = 'none'); // Hide filters
            viewAllButton.textContent = 'View Basic Info'; // Change button text
            populateAllRecords();
        } else {
            allRecordsSection.classList.add('hidden');
            basicInfoSection.classList.remove('hidden');
            prevButton.style.display = 'inline-block'; // Show navigation buttons
            nextButton.style.display = 'inline-block';
            filters.forEach(filter => filter.style.display = 'inline-block'); // Show filters
            viewAllButton.textContent = 'View All Records'; // Revert button text
        }
    });
}

function displayAllRecords() {
    const allRecordsSection = document.getElementById('all-records');
    const basicInfoSection = document.getElementById('basic-info');

    if (allRecordsSection.classList.contains('hidden')) {
        allRecordsSection.classList.remove('hidden');
        basicInfoSection.classList.add('hidden');
        populateAllRecords();
    } else {
        allRecordsSection.classList.add('hidden');
        basicInfoSection.classList.remove('hidden');
    }
}

function populateAllRecords() {
    const tableBody = document.getElementById('students-table').querySelector('tbody');
    tableBody.innerHTML = studentData.map(student =>
        `<tr>
            <td>${student.matricNo}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.contactNo}</td>
            <td>${student.email}</td>
            <td>${student.city}</td>
            <td>${student.state}</td>
            <td>${student.postcode}</td>
        </tr>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    loadXMLData().then(() => {
        setupNavigationButtons();
        setupViewAllButton();        
        setupFilters(); 
    });
});

function setupFilters() {
    const filterByState = document.getElementById('filter-by-state');
    const filterByCity = document.getElementById('filter-by-city');

    filterByState.addEventListener('change', function () {
        filterRecords('state', this.value);
        // Re-populate city options based on the selected state
        populateCityOptionsBasedOnState(this.value);
    });

    filterByCity.addEventListener('change', function () {
        filterRecords('city', this.value);
    });
}

// Adjust filterRecords function to handle filtering
function filterRecords(filterType, filterValue) {
    currentRecordIndex = 0;
    let filteredData = filterValue ? studentData.filter(student => student[filterType].toLowerCase() === filterValue.toLowerCase()) : studentData;
    displayCurrentSet(filteredData);
}
function populateFilterOptions(data) {
    let states = new Set(data.map(student => student.state));
    let cities = new Set(data.map(student => student.city));

    const filterByState = document.getElementById('filter-by-state');
    const filterByCity = document.getElementById('filter-by-city');

    // Clear existing options
    filterByState.innerHTML = '<option value="">Choose State</option>';
    filterByCity.innerHTML = '<option value="">Choose City</option>';

    [...states].sort().forEach(state => {
        filterByState.options.add(new Option(state, state));
    });

    [...cities].sort().forEach(city => {
        filterByCity.options.add(new Option(city, city));
    });
}

function populateCityOptionsBasedOnState(selectedState) {
    const cities = studentData.filter(student => student.state === selectedState).map(student => student.city);
    const uniqueCities = [...new Set(cities)].sort();
    const filterByCity = document.getElementById('filter-by-city');
    
    filterByCity.innerHTML = '<option value="">Choose City</option>';
    uniqueCities.forEach(city => {
        filterByCity.options.add(new Option(city, city));
    });
}