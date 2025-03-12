import React from "react";
import { useState, useEffect } from "react";
import styles from "../styles/Table.module.css";
import Button from "../components/Button";

const Table = ({ 
  Data = [], 
  ColumnDef = [], 
  buttons = [], 
  imageKey = [], 
  imageName = []  
}) => {
  const [columnDef, setColumnDef] = useState([]);
  const [data, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState(""); 

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(Data)) {
      setTableData(Data || []);
    }
  }, [Data]);
  
  useEffect(() => {
    if (JSON.stringify(columnDef) !== JSON.stringify(ColumnDef)) {
      setColumnDef(ColumnDef || []);
    }
  }, [ColumnDef]);
  
  const openImageModal = (imageData, imageName) => {
    setSelectedImage(imageData);
    setSelectedImageName(imageName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setSelectedImageName("");
  };

  const downloadImage = () => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${selectedImage}`;
    link.download = `${selectedImageName || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.table_container}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columnDef.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
            {buttons.length > 0 && <th>Actions</th>}
            {imageKey.length > 0 && imageName.map((name, index) => (
              <th key={`img-${index}`}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnDef.map((col, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`}>
                    {col.render ? col.render(getNestedValue(row, col.key)) : getNestedValue(row, col.key)}
                  </td>
                ))}
                {buttons.length > 0 && (
                  <td className={styles.action_col}>
                    {buttons.map((button, btnIndex) => (
                      <Button
                        key={btnIndex}
                        variant="secondary"
                        onClick={() => button.onClick(row)}
                      >
                        {button.name}
                      </Button>
                    ))}
                  </td>
                )}
                {imageKey.map((key, imgIndex) => {
                  const imageData = getNestedValue(row, key);
                  return (
                    <td key={`img-${rowIndex}-${imgIndex}`}>
                      {imageData && (
                        <img
                          src={`data:image/png;base64,${imageData}`}
                          alt={imageName[imgIndex] || "Image"}
                          width="100"
                          style={{ cursor: "pointer" }}
                          onClick={() => openImageModal(imageData, imageName[imgIndex])}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columnDef.length +
                  (buttons.length > 0 ? 1 : 0) +
                  imageKey.length
                }
                style={{ textAlign: "center" }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for image preview and download */}
      {isModalOpen && (
        <div 
          className={styles.modalOverlay}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div 
            className={styles.modalContent}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "90%",
              maxHeight: "90%",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                border: "none",
                background: "none",
                fontSize: "24px",
                cursor: "pointer"
              }}
            >
              ×
            </button>
            <img
              src={`data:image/png;base64,${selectedImage}`}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
            />
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <Button variant="primary" onClick={downloadImage}>
                Download Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get nested values from objects
const getNestedValue = (obj, path) => {
  if (!obj || !path) return "";
  return path.split(".").reduce((acc, key) => 
    (acc && acc[key] !== undefined ? acc[key] : ""), obj
  );
};

export default Table;
