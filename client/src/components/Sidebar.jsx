import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import * as formik from 'formik';
import * as yup from 'yup';
import "./Sidebar.css"
import { useState } from 'react';
import axios from "axios";

function Sidebar({rowData,setSide,setRows}) {
  const [row,setRow]=useState(rowData)
  const { Formik } = formik;
  const [volume,setVolume]=useState(rowData.volume)

    const handleSubmit= async () => {
      const payload = {
        partNumber: row.mouserPartNumber, // Replace with actual part number
        volume: volume, // Replace with actual volume
      };
      let rowArr = [];

      console.log("payload",payload);

      const elementResponse = await axios.get(`http://localhost:8000/element14`,{params:payload});
      
      const mouserResponse = await axios.post('http://localhost:8000/mouser',payload);

      const rutronikResponse = await axios.get(`http://localhost:8000/rutronikcheck`,{params:payload});

      rowArr.push(elementResponse.data);
      rowArr.push(mouserResponse.data);
      rowArr.push(rutronikResponse.data);
      rowArr.sort((a, b) => a.totalPrice - b.totalPrice);

      setRows(rowArr);


      if(row?.dataProvider === "Mouser"){
        setRow(mouserResponse.data);
      }
      else if(row?.dataProvider === "Rutronik"){
        setRow(rutronikResponse.data);
      }
      else if(row?.dataProvider === "Element14"){
        setRow(elementResponse.data);
      }
      // setSide(false);
    }


  return (
    <div className="formik">
    <Formik
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group
              as={Col}
              md="4"
              controlId="validationFormik101"
              className="position-relative"
            >
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder={row?.mouserPartNumber}
                disabled

                
              />
            </Form.Group>
            <Form.Group
              as={Col}
              md="4"
              controlId="validationFormik102"
              className="position-relative"
            >
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder={row?.manufacturer}
                disabled

              />

            </Form.Group>
            <Form.Group
              as={Col}
              md="4"
              controlId="validationFormik102"
              className="position-relative"
            >
              <Form.Label>Data Provider</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder={row?.dataProvider}
                disabled

              />

            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationFormikUsername2">
              <Form.Label>Volume</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type="text"
                  value={volume}
                  aria-describedby="inputGroupPrepend"
                  name="username"
                  onChange={(e)=>{
                    setVolume(e.target.value)
                  }}
                />
                <Form.Control.Feedback type="invalid" tooltip>
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group
              as={Col}
              md="6"
              controlId="validationFormik103"
              className="position-relative"
            >
              <Form.Label>Unit Price (At the given volume)</Form.Label>
              <Form.Control
                type="text"
                placeholder={row?.unitPrice}
                name="city"
                disabled

              />

              <Form.Control.Feedback type="invalid" tooltip>
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              as={Col}
              md="6"
              controlId="validationFormik104"
              className="position-relative"
            >
              <Form.Label>Total Price (Unit Price*Volume)</Form.Label>
              <Form.Control
                type="text"
                placeholder={row?.totalPrice}
                name="state"
                disabled
              />
              <Form.Control.Feedback type="invalid" tooltip>
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Form>
      )}
    </Formik>
    <Button variant='primary' onClick={handleSubmit}>ENTER</Button>
    <Button variant='warning' className='ms-3' onClick={()=>{
        setSide(false)
    }}>CLOSE</Button>

    </div>
  );
}

export default Sidebar;