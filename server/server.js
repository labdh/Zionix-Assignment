const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = 8000;


app.get('/element14', async (req, res) => {
  const { partNumber, volume } = req.query;

  if (!partNumber) {
    return res.status(400).json({ error: 'Missing required query parameter: partNumber' });
  }

  try {
    const response = await axios.get(`https://api.element14.com//catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=3&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u`);
    const data = response.data.manufacturerPartNumberSearchReturn.products;

    console.log('Element14 API response data:', JSON.stringify(data, null, 2));

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Unexpected response format from Element14 API' });
    }

    const rowArr = [];

    data.forEach((item) => {
      let obj = {
        mouserPartNumber: item.translatedManufacturerPartNumber,
        manufacturer: item.vendorName,
        dataProvider: "Element14",
      };

      item.prices.forEach((priceBreak) => {
        const price = parseFloat(priceBreak.cost);
        if (volume >= priceBreak.from && volume <= priceBreak.to) {
          obj.volume = volume;
          obj.unitPrice = price;
          obj.totalPrice = volume * price;
        }
      });

      rowArr.push(obj);
    });

    const leastPricedItem = rowArr.reduce((min, current) => 
      (current.totalPrice < min.totalPrice ? current : min), rowArr[0]);

    res.json(leastPricedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from Element14 API' });
  }
});

app.get('/rutronikcheck', async (req, res) => {
  const { partNumber, volume } = req.query;

  if (!partNumber) {
    return res.status(400).json({ error: 'Missing required query parameter: partNumber' });
  }

  try {
    const response = await axios.get(`https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=${partNumber}`);
    const data = response.data;
    const rowArr = [];

    data.forEach((item) => {
      let obj = {
        mouserPartNumber: item.mpn, 
        manufacturer: item.manufacturer,
        dataProvider: "Rutronik",
      };

      for (let i = 0; i < item.pricebreaks.length - 1; i++) {
        const currentBreak = item.pricebreaks[i];
        const nextBreak = item.pricebreaks[i + 1];
        const currentPrice = currentBreak.price;

        if (volume >= currentBreak.quantity && volume < nextBreak.quantity) {
          obj.volume = volume;
          obj.unitPrice = Math.ceil(currentPrice*90);
          obj.totalPrice = Math.ceil(volume * currentPrice*90);
          break;
        }
      }

      if (!obj.unitPrice && volume >= item.pricebreaks[item.pricebreaks.length - 1].quantity) {
        const lastBreak = item.pricebreaks[item.pricebreaks.length - 1];
        const lastPrice = lastBreak.price;
        obj.volume = volume;
        obj.unitPrice = Math.ceil(lastPrice*90);
        obj.totalPrice = Math.ceil(volume * lastPrice*90);
      }

      rowArr.push(obj);
    });

    const leastPricedItem = rowArr.reduce((min, current) => 
      (current.totalPrice < min.totalPrice ? current : min), rowArr[0]);

    res.json(leastPricedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from Rutronik API' });
  }
});

app.post('/mouser', async (req, res) => {
  const { partNumber, volume } = req.body;
  console.log("req.query", req.body);

  if (!partNumber || !volume) {
    return res.status(400).json({ error: 'Missing partNumber or volume' });
  }

  const payload = {
    SearchByPartRequest: {
      mouserPartNumber: partNumber,
      partSearchOptions: "string",
    },
  };

  try {
    const response = await axios.post(
      'https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560',
      payload
    );

    const data = response.data;
    const rowArr = [];

    data?.SearchResults.Parts.forEach((element) => {
      let obj = {
        mouserPartNumber: element.ManufacturerPartNumber,
        manufacturer: element.Manufacturer,
        dataProvider: "Mouser",
      };

      for (let i = 0; i < element?.PriceBreaks.length - 1; i++) {
        const currentBreak = element.PriceBreaks[i];
        const nextBreak = element.PriceBreaks[i + 1];
        const price = parseFloat(currentBreak.Price.substring(1));

        if (volume >= currentBreak.Quantity && volume < nextBreak.Quantity) {
          obj.volume = volume;
          obj.unitPrice = price;
          obj.totalPrice = volume * price;
          break;
        }
      }

      if (!obj.unitPrice && volume >= element.PriceBreaks[element.PriceBreaks.length - 1].Quantity) {
        const lastBreak = element.PriceBreaks[element.PriceBreaks.length - 1];
        const price = parseFloat(lastBreak.Price.substring(1));
        obj.volume = volume;
        obj.unitPrice = price;
        obj.totalPrice = volume * price;
      }

      rowArr.push(obj);
    });

    const leastPricedItem = rowArr.reduce((min, current) => 
      (current.totalPrice < min.totalPrice ? current : min), rowArr[0]);

    res.json(leastPricedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from Mouser API' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
