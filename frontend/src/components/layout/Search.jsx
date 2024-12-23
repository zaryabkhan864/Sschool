import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    if (keyword?.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex items-center w-full">
      <input
        type="text"
        id="search_field"
        aria-describedby="search_btn"
        className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Enter Student Name ..."
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button
        id="search_btn"
        className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
        type="submit"
      >
        <i className="fa fa-search" aria-hidden="true"></i>
      </button>
    </form>
  );
};

export default Search;
