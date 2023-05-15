import React, { useEffect, useState } from 'react';
import './App.css';
import Bar from './Bar';
import Pie from './Pie';
import axios from 'axios';

interface Options {
  marital_status: { [key: string]: string };
  sex: { [key: string]: string };
  education: { [key: string]: string };
  hispanic_origin: { [key: string]: string };
  race: { [key: string]: string };
  resident: { [key: string]: string };
  max_age: { value: number };
  cause_of_death: { [key: string]: string };
}

interface Data {
  total: number;
  data: [Values];
}

interface Values {
  id: string;
  total: number;
}

function App() {
  const onSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // send a post request to the backend with the data
    axios.post('http://127.0.0.1:5000/apply_filters', {
      marital_status: marital_status,
      sex: sex,
      education: education,
      hispanic_origin: hispanic_origin,
      race: race,
      resident: resident,
      age: age,
      drugs: drugUse
    }, {
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(res => {
        console.log(data);
        setData(res.data);
      }
      )
  };

  const [options, setOptions] = useState<Options>();
  const [data, setData] = useState<Data>();

  const [age, setAge] = useState(21);
  const [marital_status, setMaritalStatus] = useState("");
  const [sex, setSex] = useState("");
  const [education, setEducation] = useState("");
  const [race, setRace] = useState("");
  const [resident, setResidence] = useState("");
  const [hispanic_origin, setHispanicOrigin] = useState("");
  const [drugUse, setDrugUse] = useState("");
  const [graphType, setGraphType] = useState("bar");

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/get_options', {
      headers: { "Access-Control-Allow-Origin": "*" }
    })
      .then(res => { setOptions(res.data); console.log(res.data) })
      .catch(err => { console.log(err) })
  }, []);

  function getInformation() {
    // create a forloop
    // for each key in the options object

    // turn the forloop into a map function
    return data?.data.map((element) => {
      let key = element.id

      if (key.length == 1) key = "00" + key
      else if (key.length == 2) key = "0" + key

      return <div key={element.id}> <span>{element.id}</span>: {options?.cause_of_death[key]}</div>
    })
  }

  return (
    <div className="App">
      <div className="filters">
        <form onSubmit={onSubmit}>

          <div className='form-element'>
            <label>Age ({age})</label>
            <input type="range" min="0" max={options?.max_age.value} value={age} id="myRange" onChange={(e) => { setAge(Number.parseInt(e.target.value)) }} />
          </div>

          <div className="form-element">
            <label>Marital Status</label>
            <select value={marital_status} name="marital_status" id="marital_status" onChange={(e) => setMaritalStatus(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select a status</option>

              {options?.marital_status && Object.keys(options.marital_status).map((key, index) => {
                return <option key={index} value={key}>{options.marital_status[key]}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Sex</label>
            <select value={sex} name="sex" id="sex" onChange={(e) => setSex(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select a sex</option>

              {options?.sex && Object.keys(options.sex).map((key, index) => {
                return <option key={index} value={key}>{options.sex[key]}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Education</label>
            <select value={education} name="education" id="education" onChange={(e) => setEducation(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select education</option>

              {options?.education && Object.keys(options.education).map((key, index) => {
                return <option key={index} value={key}>{options.education[key]}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Hispanic Origin</label>
            <select value={hispanic_origin} name="hispanic-origin" id="ho" onChange={(e) => setHispanicOrigin(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select a status</option>

              {options?.hispanic_origin && Object.keys(options.hispanic_origin).map((key, index) => {
                return <option key={index} value={key}>{options.hispanic_origin[key]}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Race</label>
            <select value={race} name="race" id="race" onChange={(e) => setRace(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select a race</option>

              {options?.race && Object.keys(options.race).map((key, index) => {
                return <option key={index} value={key}>{options.race[key]}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Residence</label>
            <select value={resident} name="resident" id="resident" onChange={(e) => setResidence(e.target.value)}>
              {/* get all options out of data */}
              <option value="select">Select a residence</option>

              {options?.resident && Object.keys(options.resident).map((key, index) => {
                return <option key={index} value={key}>{options.resident[key].charAt(0).toUpperCase() + options.resident[key].slice(1).toLowerCase()}</option>
              })}

            </select>
          </div>

          <div className="form-element">
            <label>Graph Type</label>
            <select value={graphType} name="graph" id="graph" onChange={(e) => setGraphType(e.target.value)}>
              {/* get all options out of data */}
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
            </select>
          </div>

          <input type="submit" value="Submit" />
        </form>
      </div>
      {data && <div className="total">Total: {data['total']} individuals</div>}

      <div className="group">
        {data && data['data'].length > 0 &&
          <><div className="graphs">
            {graphType === "bar" && <Bar data={data['data']} />}
            {graphType === "pie" && <Pie data={data['data']} />}
          </div><div className="information">
              <h2>Information</h2>
              {/* display items from options.cause_of_death if they are in data */}
              {getInformation()}
            </div></>
        }
      </div>
    </div>
  );
}

export default App;

{/* <div className="form-element">
<label>Drug Use</label>
<select value={drugUse} name="drugs" id="drugs" onChange={(e) => setDrugUse(e.target.value)}>
  <option value="select">Select an option</option>
  <option value="no">No</option>
  <option value="yes">Yes</option>
</select>
</div> */}
