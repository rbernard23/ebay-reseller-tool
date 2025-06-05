import React, { useState } from "react";
import axios from "axios";

export default function EbayResellTool() {
  const [keyword, setKeyword] = useState("");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const fetchData = async () => {
    if (!keyword) return;
    setLoading(true);
    setResults(null);

    const appId = "ReganBer-Quickfli-SBX-ff05a19a4-41ed49eb";

    try {
      const conditionFilter = condition ? { 'itemFilter(0).name': 'Condition', 'itemFilter(0).value': condition } : {};

      const activeRes = await axios.get(
        `https://svcs.ebay.com/services/search/FindingService/v1`, {
          params: {
            'OPERATION-NAME': 'findItemsByKeywords',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            keywords: keyword,
            'paginationInput.entriesPerPage': 50,
            ...conditionFilter,
          },
        }
      );

      const soldRes = await axios.get(
        `https://svcs.ebay.com/services/search/FindingService/v1`, {
          params: {
            'OPERATION-NAME': 'findCompletedItems',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            keywords: keyword,
            'itemFilter(0).name': 'SoldItemsOnly',
            'itemFilter(0).value': 'true',
            'paginationInput.entriesPerPage': 50,
            ...conditionFilter,
          },
        }
      );

      const soldItems = soldRes.data.findCompletedItemsResponse[0].searchResult[0].item || [];
      const totalSold = soldItems.length;
      const avgPrice =
        soldItems.reduce((sum, item) => sum + parseFloat(item.sellingStatus[0].currentPrice[0].__value__), 0) /
        (totalSold || 1);

      setResults({
        totalActive: activeRes.data.findItemsByKeywordsResponse[0].searchResult[0]['@count'],
        totalSold,
        avgPrice: avgPrice.toFixed(2),
        soldItems,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch from eBay. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">eBay Resell Research Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          className="border p-2 rounded w-full"
          placeholder="Search item (e.g., Nintendo Switch)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">All Conditions</option>
          <option value="1000">New</option>
          <option value="3000">Used</option>
        </select>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          onClick={fetchData}
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading...</p>}

      {results && (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-2xl font-semibold">Results for "{keyword}"</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-xl font-bold">{results.totalActive}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Sold Items (50 max)</p>
              <p className="text-xl font-bold">{results.totalSold}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">Average Sold Price</p>
              <p className="text-xl font-bold">${results.avgPrice}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6">Recent Sold Listings</h3>
          <ul className="space-y-2">
            {results.soldItems.slice(0, 10).map((item, i) => (
              <li key={i} className="border-b pb-2">
                <a
                  href={item.viewItemURL[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.title[0]}
                </a>
                <div className="text-sm text-gray-600">
                  ${item.sellingStatus[0].currentPrice[0].__value__}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
