import React, { useState } from "react";
import axios from "axios";
import "./Home.css";
import TableComponent from "./Table";
import Sidebar from "./Sidebar";

function Home() {
  const [volume, setVolume] = useState();
  const [partNumber, setPartNumber] = useState();
  const [rows, setRows] = useState([]);
  const [side,setSide] = useState(false)

  const handleSumbit = async () => {

    const payload = {
      partNumber: partNumber, // Replace with actual part number
      volume: volume, // Replace with actual volume
    };

    let rowArr = [];

    const mouserResponse = await axios.post('http://localhost:8000/mouser',payload);
    console.log("mouser",mouserResponse);
        
    
    const elementResponse = await axios.get(`http://localhost:8000/element14`,{params:payload});
    console.log("element",elementResponse);

    const rutronikResponse = await axios.get(`http://localhost:8000/rutronikcheck`,{params:payload});
    console.log("rutronik",rutronikResponse);

    // rowArr.push(leastPricedItem);
    rowArr.push(mouserResponse.data);
    rowArr.push(elementResponse.data);
    rowArr.push(rutronikResponse.data);
    rowArr.sort((a, b) => a.totalPrice - b.totalPrice);

    setRows(rowArr);

    setVolume("-");
    setPartNumber("");
  };

  return (
    <div className="home">
      <div className="mainPage">
        <form className="home_form">
          <div className="mb-3">
            <label className="form-label">PART NUMBER</label>
            <input
              value={partNumber}
              type="text"
              className="form-control"
              id="partNumber"
              aria-describedby="partNumber"
              onChange={(e) => {
                setPartNumber(e.target.value);
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">VOLUME</label>
            <input
              value={volume}
              type="text"
              className="form-control"
              id="volume"
              onChange={(e) => {
                setVolume(e.target.value);
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSumbit}
          >
            Enter
          </button>
        </form>

        <TableComponent data={rows} setSide={setSide}/>
      </div>
      {side &&
      <div className="sidebar">
        <Sidebar rowData={rows[0]} setSide={setSide} setRows={setRows} />
      </div>
}
    </div>
    
  );
}

export default Home;
