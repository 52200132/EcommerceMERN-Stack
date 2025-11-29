import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchBox = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("")

  const updateParams = (nextEntries, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextEntries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  useEffect(() => {
    console.log('searchParams changed:', searchParams.toString());
    const qParam = searchParams.get("q") || "";
    setSearchValue(qParam);
  }, [searchParams]);

  const handleOnEnterDown = (e) => {
    if (e.key === "Enter") {
      if (searchValue.trim().length > 0) {
        updateParams({ q: searchValue.trim() }, true);
      }
    }
  }

  return (
    <>
      <div className="search-input">
        <input type="text" placeholder="Tìm kiếm sản phẩm" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={handleOnEnterDown} />
      </div>
      <div className="search-btn" onClick={() => {
        if (searchValue.trim().length > 0) {
          updateParams({ q: searchValue.trim() }, true);
        }
      }}>
        <button><i className="lni lni-search-alt"></i></button>
      </div>
    </>
  )
}

export default SearchBox;