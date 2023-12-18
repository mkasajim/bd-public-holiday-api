const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();

app.use(cors()); // Enable CORS for all routes

app.get('/:year', async (req, res) => {
    try {
        const year = req.params.year;
        const url = `https://publicholidays.com.bd/${year}-dates/`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);

        // Further steps will be implemented here
      
        /// Inside the try block, after loading the HTML with cheerio
        const tableRows = $('.publicholidays.phgtable tbody tr');
        const holidays = [];

        tableRows.each((i, row) => {
            // Check if the row contains a 'td' with 'colspan="3"'
            const colspanElement = $(row).find('td[colspan="3"]');
            if (colspanElement.length === 0) {
                // Process rows that do not have a 'td' with 'colspan="3"'
                const columns = $(row).find('td');
                const holidayData = {
                    "Date": $(columns[0]).text().trim(),
                    "Day": $(columns[1]).text().trim(),
                    "Holiday Name": $(columns[2]).text().trim()
                };
                holidays.push(holidayData);
            }
            // Skip rows with 'td[colspan="3"]'
        });

        res.json(holidays);


    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).send({ error: 'Error fetching data' });
    }
});


// Existing imports and app setup...

app.get('/:year/:month', async (req, res) => {
    try {
        const year = req.params.year;
        const month = req.params.month;
        const monthAbbreviation = getMonthAbbreviation(month);  // Convert numeric month to abbreviation
        const url = `https://publicholidays.com.bd/${year}-dates/`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        const $ = cheerio.load(response.data);

        const tableRows = $('.publicholidays.phgtable tbody tr');
        const allHolidays = [];

        tableRows.each((i, row) => {
            const colspanElement = $(row).find('td[colspan="3"]');
            if (colspanElement.length === 0) {
                const columns = $(row).find('td');
                const holidayData = {
                    "Date": $(columns[0]).text().trim(),
                    "Day": $(columns[1]).text().trim(),
                    "Holiday Name": $(columns[2]).text().trim()
                };
                allHolidays.push(holidayData);
            }
        });

        // Filter holidays by the specified month
        const filteredHolidays = allHolidays.filter(holiday => {
            const [holidayDay, holidayMonth] = holiday.Date.split(' ');
            return holidayMonth === monthAbbreviation;
        });

        res.json(filteredHolidays);

    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).send({ error: 'Error fetching data' });
    }
});

// Remaining code...

// Function to convert numeric month to three-letter abbreviation
function getMonthAbbreviation(monthNumber) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNumber, 10) - 1];
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

