// create a basic form with slider and dropdowns

import React, { useState, useEffect, SetStateAction } from 'react';
import axios from 'axios';
import { json } from 'stream/consumers';

interface Options {
  marital_status: { [key: string]: string};
  sex: { [key: string]: string};
  education: { [key: string]: string};
  hispanic_origin: { [key: string]: string};
  race: { [key: string]: string};
  resident: { [key: string]: string};
}


function Form() {
  const onSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // send a post request to the backend with the data
    axios.post('http://localhost:5000/apply_filters', {
      marital_status: marital_status,
      })
      .then(res => {
        console.log(res.data);
      }
    )
  };

  // on load, get the data from the backend
  const [data, setData] = useState<Options>();

  const [marital_status, setMaritalStatus] = useState("");
  const [sex, setSex] = useState("");
  const [education, setEducation] = useState("");
  const [race, setRace] = useState("");
  const [resident, setResidence] = useState("");
  const [hispanic_origin, setHispanicOrigin] = useState("");

  useEffect(() => {
    if (data?.marital_status === undefined) {
        axios.get('http://127.0.0.1:5000/get_options')
          .then(res => { setData(res.data); console.log(res.data) })
          .catch(err => {  console.log(err) })
    }
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <div className="form-element">
        <label>Marital Status</label>
        <select value={marital_status} name="marital_status" id="marital_status" onChange={(e) => setMaritalStatus(e.target.value)}>
          {/* get all options out of data */}
          <option value="select">Select a status</option>

          {data?.marital_status && Object.keys(data.marital_status).map((key, index) => {
            return <option key={index} value={key}>{data.marital_status[key]}</option>
          })}

        </select>
      </div>

      <div className="form-element">
        <label>Sex</label>
        <select value={sex} name="sex" id="sex"  onChange={(e) => setSex(e.target.value)}>
          {/* get all options out of data */}
          <option value="select">Select a sex</option>

          {data?.sex && Object.keys(data.sex).map((key, index) => {
            return <option key={index} value={key}>{data.sex[key]}</option>
          })}

        </select>
      </div>

      <div className="form-element">
        <label>Education</label>
        <select value={education} name="education" id="education" required>
          {/* get all options out of data */}
          <option value="select">Select education</option>

          {data?.education && Object.keys(data.education).map((key, index) => {
            return <option key={index} value={key}>{data.education[key]}</option>
          })}

        </select>
      </div>

      <div className="form-element">
        <label>Hispanic Origin</label>
        <select value={hispanic_origin} name="hispanic-origin" id="ho" required>
          {/* get all options out of data */}
          <option value="select">Select a status</option>

          {data?.hispanic_origin && Object.keys(data.hispanic_origin).map((key, index) => {
            return <option key={index} value={key}>{data.hispanic_origin[key]}</option>
          })}

        </select>
      </div>

      <div className="form-element">
        <label>Race</label>
        <select value={race} name="race" id="race" required>
          {/* get all options out of data */}
          <option value="select">Select a race</option>

          {data?.race && Object.keys(data.race).map((key, index) => {
            return <option key={index} value={key}>{data.race[key]}</option>
          })}

        </select>
      </div>

      <div className="form-element">
        <label>Residence</label>
        <select value={resident} name="resident" id="resident" required>
          {/* get all options out of data */}
          <option value="select">Select a residence</option>

          {data?.resident && Object.keys(data.resident).map((key, index) => {
            return <option key={index} value={key}>{data.resident[key]}</option>
          })}

        </select>
      </div>

      <input type="submit" value="Submit" />
    </form>
  )
}

export default Form;