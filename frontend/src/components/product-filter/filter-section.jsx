import { useEffect, useState } from "react";

import filterOptions from "../../pages/products-filter/filter";
import { Button, Form, OverlayTrigger, Popover } from "react-bootstrap";
import { fa } from "zod/v4/locales";

const FilterSection = ({ title, categorySlug }) => {
  // console.log(filterOptions[categorySlug]);
  const [overlaysState, setOverlaysState] = useState({});
  const [activeSubsection, setActiveSubsection] = useState([]);
  const [filterState, setFilterState] = useState(() => {
    const olState = {};
    const tmep2 = Array.isArray(filterOptions[categorySlug]?.filterFields) ?
      filterOptions[categorySlug]?.filterFields.reduce((temp3, field) => {
        olState[field.attribute] = false;
        temp3[field.attribute] = {
          active: false,
          selectedValues: new Set(),
          getOrigin: () => field,
        };
        return temp3;
      }, {}) : {};
    // for test
    tmep2["screen_size"].active = true;
    tmep2["screen_size"].selectedValues.add("15.6 inch");
    tmep2["screen_size"].selectedValues.add("15.6 asdfa sd");
    console.log('tmep2', tmep2);
    setOverlaysState(olState);
    return tmep2;
  });

  const togoleOverlayState = (attribute) => {
    if (overlaysState[attribute]) {

    }
    setOverlaysState(prev => ({
      ...prev,
      [attribute]: !prev[attribute],
    }));
  };

  const setShowOverlayState = (attribute, show) => {
    setOverlaysState(prev => ({
      ...prev,
      [attribute]: show,
    }));
  }

  const handleDeleteFilterActive = (attribute) => {
    setActiveSubsection(prev => prev.filter(attr => attr !== attribute));
    setFilterState(prev => ({ ...prev, [attribute]: { ...prev[attribute], active: false, selectedValues: new Set() } }));
  }

  // eslint-disable-next-line no-unused-vars
  const handleDeleteAllFilterActive = () => {
    setActiveSubsection([]);
    setFilterState(prev => {
      const next = prev;
      activeSubsection.forEach(attr => {
        next[attr].active = false;
        next[attr].selectedValues = new Set();
      });
      return next;
    });
  }

  const handleSelectFilterValue = (attribute, value, isChecked) => {
    console.log('handleSelectFilterValue', attribute, value, isChecked);
    setFilterState(prev => {
      const next = { ...prev };
      const prevSelectedValues = next[attribute].selectedValues;
      if (isChecked) {
        prevSelectedValues.add(value);
      } else {
        prevSelectedValues.delete(value);
      }
      if (prevSelectedValues.size > 0) {
        next[attribute].active = true;
        // setActiveSubsection(p => p.includes(attribute) ? p : [...p, attribute]);
      } else {
        next[attribute].active = false;
        // setActiveSubsection(p => p.filter(attr => attr !== attribute));
      }
      return next;
    });
  };

  const handleApplyFilterValues = (attribute) => {
    setActiveSubsection(prev => prev.includes(attribute) ? prev : [...prev, attribute]);
    setShowOverlayState(attribute, false);
  }

  useEffect(() => {
    console.log('filterState changed', activeSubsection);
  }, [activeSubsection]);

  const renderFilterFieldValues = (field) => {
    const isRangeType = field.type === "range";
    if (isRangeType) {
      return (
        <Form.Range
          key={field.attribute}
          min={field.values[0]}
          max={field.values[1]}
        />
      )
    }
    return (
      <>
        <div key={field.attribute} className={`pill-list mb-2 ${filterState[field.attribute]?.active ? "active" : ""}`}>
          {field.values?.map((value => {
            const isSelected = filterState[field.attribute]?.selectedValues.has(value);
            return (
              <button
                className={`pill ${isSelected ? "active" : ""}`}
                key={value}
                onClick={() => { handleSelectFilterValue(field.attribute, value, !isSelected); }}
                type="button"
              >
                {value}
              </button>
            );
          }))}
          {/* Render filter controls based on field.type */}
        </div>
      </>
    )
  };

  return (
    <>
      <div className="filter-section mb-3">
        {filterOptions[categorySlug]?.filterFields.map((field) => (
          <OverlayTrigger
            key={field.attribute}
            placement="bottom-end"
            rootClose={true}
            onToggle={(newShow) => !togoleOverlayState(field.attribute) && console.log('onToggle', newShow)}
            show={overlaysState[field.attribute]}
            trigger="click"
            overlay={
              <Popover a
              // rrowProps={{ style: { display: "none" } }}
              >
                {renderFilterFieldValues(field)}
                <div key={`actions-${field.attribute}`} className="feild-filter-actions">
                  <Button variant="outline-secondary" className="close-button"
                    onClick={() => setShowOverlayState(field.attribute, false)}
                  >
                    Đóng
                  </Button>
                  <Button className="apply-button" disabled={filterState[field.attribute]?.selectedValues.size === 0}
                    onClick={() => handleApplyFilterValues(field.attribute)}
                  >
                    Áp dụng
                  </Button>
                </div>
              </Popover>
            }
          >
            <div
              className={`filter-field ${filterState[field.attribute]?.active || overlaysState[field.attribute] ? "active" : ""}`}
              onClick={() => overlaysState[field.attribute] && setShowOverlayState(field.attribute, true)}
            >
              <span className="field-label">{field.label}</span>
            </div>
          </OverlayTrigger>
        ))}
      </div>
      <div className=" mb-3">
        {activeSubsection.length > 0 && <h5>Lọc theo</h5>}
        {activeSubsection?.map((subsec) => {
          const activeField = filterState[subsec];
          const fieldLabel = activeField?.getOrigin().label || "";
          return (
            <div key={subsec} className="filter-subsection active">
              <span className="section-title">
                {fieldLabel + ": "}
                {[...activeField.selectedValues].join(" | ")}
              </span>
              <span onClick={() => handleDeleteFilterActive(subsec)}>x</span>
            </div>
          )
        })}
        {activeSubsection.length > 0 && (
          <Button variant="link" onClick={handleDeleteAllFilterActive}>Xóa tất cả</Button>
        )}
      </div>
    </>
  );
};

export default FilterSection;