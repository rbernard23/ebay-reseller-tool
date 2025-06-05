import React, { useState, useEffect } from "react";
import axios from "axios";

const APP_ID = "ReganBer-Quickfli-SBX-ff05a19a4-41ed49eb"; // Your eBay App ID

const conditions = [
  { label: "All", value: "" },
  { label: "New", value: "1000" },
  { label: "Used", value: "3000" }
];

function App() {
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const url = `https://svcs.ebay.com/services/search/FindingService/v1`;
      let queryString = `?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD=true&keywords=${encodeURIComponent(
        query
      )}&itemFilter(1).name=SoldItemsOnly&itemFilter(1).value=true&paginationInput.entriesPerPage=10&paginationInput.pageNumber=1`;

      if (condition) {
        queryString += `&itemFilter(0).name=Condition&itemFilter(0).value=${condition}`;
      }

      const response = await axios.get(url + queryString);
      const results =
        response.data.findCompletedItemsResponse[0].searchResult[0].item || [];

      const formattedItems = results.map((item) => ({
        title: item.title[0],
        price: item.sellingStatus[0].convertedCurrentPrice[0].__value__,
        url: item.viewItemURL[0],
        endTime: item.listingInfo[0].endTime[0]
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching eBay data:", error);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (query) {
      fetchItems();
    } else {
      setItems([]);
    }
  }, [query, condition]);

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>eBay Resell Tool</h1>
      <div style={{ marginBottom: 20, display: "flex", gap: 10, justifyContent: "center" }}>
        <input
          style={{ flex: 1, padding: 8, fontSize: 16 }}
          placeholder="Search eBay items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        >
          {conditions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              borderBottom: "1px solid #ccc",
              padding: "10px 0"
            }}
          >
            <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 18 }}>
              {item.title}
            </a>
            <p style={{ margin: "5px 0" }}>
              Sold Price: <strong>${item.price}</strong>
            </p>
            <p style={{ color: "#666", fontSize: 12 }}>
              Ended: {new Date(item.endTime).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
