import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "react-js-pagination";

const CustomPagination = ({ resPerPage, filteredStudentsCount }) => {
  const [currentPage, setCurrentPage] = useState();

  let [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const setCurrentPageNo = (pageNumber) => {
    setCurrentPage(pageNumber);

    if (searchParams.has("page")) {
      searchParams.set("page", pageNumber);
    } else {
      searchParams.append("page", pageNumber);
    }

    const path = window.location.pathname + "?" + searchParams.toString();
    navigate(path);
  };

  return (
    <div className="flex justify-center my-5">
      {filteredStudentsCount > resPerPage && (
        <Pagination
          activePage={currentPage}
          itemsCountPerPage={resPerPage}
          totalItemsCount={filteredStudentsCount}
          onChange={setCurrentPageNo}
          nextPageText={"Next"}
          prevPageText={"Prev"}
          firstPageText={"First"}
          lastPageText={"Last"}
          itemClass="px-3 py-2 border rounded-lg text-blue-500 hover:bg-blue-100"
          linkClass="text-sm"
        />
      )}
    </div>
  );
};

export default CustomPagination;
