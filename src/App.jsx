import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import $ from "jquery"
import port from "../port";

const File = ({ name, id, i, click }) => (
		<div className="file row px-2" onClick={(e) => click({e: e, i: i})}>
			<div className="col-auto text-center">{i}:</div>
			<div className="col-5">name: {name}</div>
			<div className="col-5">id: {id}</div>
		</div>
)

function App() {
	const [signedIn, SetSignedIn] = useState(false);
	const [files, SetFiles] = useState([]);
	const selects = useRef([])

	const SelectFile = (json) => {
		const {e, i} = json;
		e.currentTarget.classList.toggle('selected') ? selects.current.push(i) : selects.current.splice(selects.current.findIndex(el => el == i), 1) 
		console.log(selects.current)
	}

	useEffect(() => {
		axios(port + "/hasToken")
			.then((data) => {
				SetSignedIn(true); 
				axios.get(port + "/listFiles").then(({ data }) => SetFiles(data.files || null))
			})
			.catch((err) => SetSignedIn(false));

	}, []);

	return (
		<div className="app">
			<div className="nav px-2 text-white align-items-center justify-content-between">
				<h1>EMU SYNC</h1>
				{!signedIn && (
					<button
						className="btn btn-primary"
						onClick={() =>
							axios("http://localhost:8888/oauth").then((res) =>
								window.location.replace(res.data.location)
							)
						}
					>
						Login
					</button>
				)}
				{signedIn && (
					<button
						className="btn btn-primary"
						onClick={() =>
							axios("http://localhost:8888/signOut").then((res) =>
								SetSignedIn(false)
							)
						}
					>
						Logout
					</button>
				)}
			</div>

			<div className="main gy-2">
				<div className="buttons">
					<button
					className="btn btn-secondary"
					onClick={() => axios.post(port + "/download", { some: "thing" })}
				>
					Download ps2
				</button>
				<button
					className="btn btn-secondary mx-1"
					onClick={() => axios.get(port + "/listFiles").then(({ data }) => SetFiles(data.files))}
				>
					List Files
					</button>
				</div>
				
				<div className="files-container my-2">
					{files.map((el, i) => <File name={el.name} id={el.id} i={i} click={SelectFile}  key={i} />)}
				</div>
			</div>

			<div className="foot">

				<button
					className="btn btn-secondary mx-1"
					onClick={() => {
						axios.post(port + "/main", { 
							method: "download",
							files: selects.current.map(el => files[el]),
							path: "C:/Users/Lemond Wyatt/Documents/PCSX2/memcards"
						}).finally(console.log);

						selects.current = [] 
						$('.selected').removeClass('selected')
					}}
				>
					Download
				</button>

				<button
					className="btn btn-secondary "
					onClick={() => {
						axios.post(port + "/main", { 
							method: "delete",
							files: selects.current.map(el => files[el]),
						}).finally(console.log);

						SetFiles(files.filter((el, i) => !selects.current.includes(i)));
						selects.current = [] 
						$('.selected').removeClass('selected')
						console.log('here')
					}}> Delete
				</button>
			</div>

		</div>
	);
}

export default App;
