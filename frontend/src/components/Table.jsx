import { useState, useEffect } from "react";
import styles from "../styles/Table.module.css";
import Button from "../components/Button";

const Table = ({ Data = [], ColumnDef = [], buttons = [], imageKey = "" }) => {
  const [columnDef, setColumnDef] = useState([]);
  const [data, setTableData] = useState([]);

  useEffect(() => {
    setTableData(Data || []);
  }, [Data]);

  useEffect(() => {
    setColumnDef(ColumnDef || []);
  }, [ColumnDef]);

  return (
    <div className={styles.table_container}>
    <table className={styles.table}>
      <thead>
        <tr>
          {columnDef.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
          {buttons.length > 0 && <th>Actions</th>}
          {imageKey && <th>Image</th>}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columnDef.map((col, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`}>{getNestedValue(row, col.key)}</td>
              ))}
              {buttons.length > 0 && (
                <td>
                  {buttons.map((button, btnIndex) => (
                    <Button key={btnIndex} variant="secondary" onClick={() => button.onClick(row)}>
                      {button.name}
                    </Button>
                  ))}
                </td>
              )}
              {imageKey && getNestedValue(row, imageKey) && (
                <td>
                  <img
                    src={`data:image/png;base64,${getNestedValue(row, imageKey)}`}
                    alt="Book Image"
                    width="100"
                  />
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columnDef.length + (buttons.length > 0 ? 1 : 0) + (imageKey ? 1 : 0)} style={{ textAlign: "center" }}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
};

export default Table;

// Helper function to get nested values from objects
const getNestedValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ""), obj);
};
