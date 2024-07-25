import Button from 'react-bootstrap/Button';
import Table from "react-bootstrap/Table";

function TableComponent({ data,setSide}) {





  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Part Number</th>
          <th>Manufacturer</th>
          <th>Data Provider</th>
          <th>Volume</th>
          <th>Unit Price (At the given volume)</th>
          <th>Total Price (Unit Price*Volume)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((ele,idx) => {
            if(idx === 0) {
              return (<tr key={idx}>
                <td>{ele.mouserPartNumber}</td>
                <td>{ele.manufacturer}</td>
                <td>{ele.dataProvider}</td>
                <td>{ele.volume}</td>
                <td>{ele.unitPrice}</td>
                <td>{ele.totalPrice}</td>
                <td><Button variant="primary" onClick={()=>{
                    setSide(true)
                }}>ADD TO CART</Button></td>
              </tr>)
             }
             else{
              return (<tr key={idx}>
                <td>{ele.mouserPartNumber}</td>
                <td>{ele.manufacturer}</td>
                <td>{ele.dataProvider}</td>
                <td>{ele.volume}</td>
                <td>{ele.unitPrice}</td>
                <td>{ele.totalPrice}</td>
              </tr>)
             };
          
        })}
      </tbody>
    </Table>
  );
}

export default TableComponent;
