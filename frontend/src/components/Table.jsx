import {useState,useEffect, use} from 'react'
import styles from '../styles/Table.module.css';
import Button from '../components/Button';


const Table = ({ Data,ColumnDef,buttons=[]}) => {

    const [columnDef, setColumnDef] = useState([]);
    const [data, setTableData] = useState([]);


    useEffect(() => {
        setTableData(Data);
    }, [Data]);

    useEffect(() => {
        setColumnDef(ColumnDef);

    }, [ColumnDef]);


    return (
        <table>
            <thead>
                <tr>
                    {columnDef.map((col, index) => (
                        <th key={index}>{col.header}</th>
                    ))}
                    {
                        buttons.map((button, index) => (
                            <th key={index}>{button.name}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {columnDef.map((col, index) => (
                            <td key={index}>{row[col.key]}</td>
                        ))}

                            {
                                buttons.map((button, index) => (
                                    <td><Button key={index} variant="secondary" onClick={()=>button.onClick(row)}>{button.name}</Button></td>
                                ))
                            }
                    </tr>

                ))}
            </tbody>
        </table>
    );
}

export default Table;