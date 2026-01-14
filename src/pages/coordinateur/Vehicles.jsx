import React, { useState } from "react";

const initialVehicles = [
	{ 
		id: 1, 
		name: "Peugeot 208", 
		plate: "123-ABC", 
		available: true, 
		direction: "Rabat-Casa",
		type: "Berline",
		seats: 5,
		fuel: "Diesel",
		lastMaintenance: "2025-12-15"
	},
	{ 
		id: 2, 
		name: "Renault Clio", 
		plate: "456-DEF", 
		available: false, 
		direction: "Meknès-Errachidia",
		type: "Citadine",
		seats: 4,
		fuel: "Essence",
		lastMaintenance: "2025-11-20",
		assignedTo: "Ahmed Ben Ali",
		assignedUntil: "2026-01-15"
	},
	{ 
		id: 3, 
		name: "Dacia Logan", 
		plate: "789-GHI", 
		available: true, 
		direction: "Marrakech-Agadir",
		type: "Berline",
		seats: 5,
		fuel: "Diesel",
		lastMaintenance: "2026-01-05"
	},
];

const directions = ["Rabat-Casa", "Meknès-Errachidia", "Marrakech-Agadir", "Tanger-Tétouan", "Fès-Oujda"];
const vehicleTypes = ["Berline", "Citadine", "SUV", "Utilitaire"];
const fuelTypes = ["Essence", "Diesel", "Hybride", "Électrique"];

const Vehicles = () => {
	const [vehicles, setVehicles] = useState(initialVehicles);
	const [form, setForm] = useState({ 
		name: "", 
		plate: "", 
		available: true, 
		direction: directions[0],
		type: vehicleTypes[0],
		seats: 5,
		fuel: fuelTypes[0],
		lastMaintenance: ""
	});
	const [showForm, setShowForm] = useState(false);
	const [editingVehicle, setEditingVehicle] = useState(null);
	const [filterAvailable, setFilterAvailable] = useState("all");

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingVehicle) {
			setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...form, id: editingVehicle.id } : v));
			setEditingVehicle(null);
			alert("Véhicule modifié avec succès !");
		} else {
			setVehicles([...vehicles, { ...form, id: Date.now() }]);
			alert("Véhicule ajouté avec succès !");
		}
		setForm({ 
			name: "", 
			plate: "", 
			available: true, 
			direction: directions[0],
			type: vehicleTypes[0],
			seats: 5,
			fuel: fuelTypes[0],
			lastMaintenance: ""
		});
		setShowForm(false);
	};

	const handleEdit = (vehicle) => {
		setEditingVehicle(vehicle);
		setForm({
			name: vehicle.name,
			plate: vehicle.plate,
			available: vehicle.available,
			direction: vehicle.direction,
			type: vehicle.type,
			seats: vehicle.seats,
			fuel: vehicle.fuel,
			lastMaintenance: vehicle.lastMaintenance
		});
		setShowForm(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleDelete = (id) => {
		if (window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
			setVehicles(vehicles.filter(v => v.id !== id));
			alert("Véhicule supprimé !");
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setEditingVehicle(null);
		setForm({ 
			name: "", 
			plate: "", 
			available: true, 
			direction: directions[0],
			type: vehicleTypes[0],
			seats: 5,
			fuel: fuelTypes[0],
			lastMaintenance: ""
		});
	};

	const filteredVehicles = vehicles.filter(v => {
		if (filterAvailable === "available") return v.available;
		if (filterAvailable === "unavailable") return !v.available;
		return true;
	});

	const availableCount = vehicles.filter(v => v.available).length;
	const unavailableCount = vehicles.filter(v => !v.available).length;

	return (
		<div className="vehicles-page-full">
			{/* Header avec filtres intégrés */}
			<div className="vehicles-header-full">
				<div className="header-left">
					<h1>GESTION DES VÉHICULES</h1>
					<div className="stats-inline">
						<span className="stat-inline">Total: <strong>{vehicles.length}</strong></span>
						<span className="stat-inline">Disponibles: <strong>{availableCount}</strong></span>
						<span className="stat-inline">En mission: <strong>{unavailableCount}</strong></span>
					</div>
				</div>
				<div className="header-right">
					<div className="filter-group">
						<button
							className={`filter-btn-compact ${filterAvailable === "all" ? "active" : ""}`}
							onClick={() => setFilterAvailable("all")}
						>
							Tous
						</button>
						<button
							className={`filter-btn-compact ${filterAvailable === "available" ? "active" : ""}`}
							onClick={() => setFilterAvailable("available")}
						>
							Disponibles
						</button>
						<button
							className={`filter-btn-compact ${filterAvailable === "unavailable" ? "active" : ""}`}
							onClick={() => setFilterAvailable("unavailable")}
						>
							En mission
						</button>
					</div>
					{!showForm && (
						<button 
							className="btn-add-vehicle"
							onClick={() => setShowForm(true)}
						>
							+ Nouveau véhicule
						</button>
					)}
				</div>
			</div>

			{/* Formulaire d'ajout/modification */}
			{showForm && (
				<div className="vehicle-form-full">
					<form onSubmit={handleSubmit}>
						<div className="form-title-bar">
							<h3>{editingVehicle ? "MODIFIER LE VÉHICULE" : "NOUVEAU VÉHICULE"}</h3>
							<button type="button" className="btn-close-form" onClick={handleCancel}>✕</button>
						</div>

						<div className="form-grid">
							<div className="form-field">
								<label>Nom du véhicule</label>
								<input 
									name="name" 
									value={form.name} 
									onChange={handleChange} 
									placeholder="Ex: Peugeot 208" 
									required 
								/>
							</div>
							<div className="form-field">
								<label>Immatriculation</label>
								<input 
									name="plate" 
									value={form.plate} 
									onChange={handleChange} 
									placeholder="Ex: 123-ABC" 
									required 
								/>
							</div>
							<div className="form-field">
								<label>Type de véhicule</label>
								<select name="type" value={form.type} onChange={handleChange}>
									{vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
								</select>
							</div>
							<div className="form-field">
								<label>Places</label>
								<input 
									type="number" 
									name="seats" 
									value={form.seats} 
									onChange={handleChange} 
									min="2"
									max="9"
									required 
								/>
							</div>
							<div className="form-field">
								<label>Carburant</label>
								<select name="fuel" value={form.fuel} onChange={handleChange}>
									{fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
								</select>
							</div>
							<div className="form-field">
								<label>Direction/Ligne</label>
								<select name="direction" value={form.direction} onChange={handleChange}>
									{directions.map((d) => <option key={d} value={d}>{d}</option>)}
								</select>
							</div>
							<div className="form-field checkbox-field">
								<label>
									<input 
										type="checkbox" 
										name="available" 
										checked={form.available} 
										onChange={handleChange}
									/>
									<span>Disponible</span>
								</label>
							</div>
							<div className="form-field">
								<label>Dernière maintenance</label>
								<input 
									type="date" 
									name="lastMaintenance" 
									value={form.lastMaintenance} 
									onChange={handleChange} 
								/>
							</div>
						</div>

						<div className="form-actions-bar">
							<button type="button" className="btn-form-cancel" onClick={handleCancel}>
								Annuler
							</button>
							<button type="submit" className="btn-form-submit">
								{editingVehicle ? "Enregistrer les modifications" : "Ajouter le véhicule"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Table des véhicules */}
			<div className="vehicles-table-container">
				{filteredVehicles.length === 0 ? (
					<div className="empty-state-full">
						<p>Aucun véhicule à afficher</p>
					</div>
				) : (
					<table className="vehicles-table">
						<thead>
							<tr>
								<th>VÉHICULE</th>
								<th>IMMATRICULATION</th>
								<th>TYPE</th>
								<th>DIRECTION</th>
								<th>PLACES</th>
								<th>CARBURANT</th>
								<th>MAINTENANCE</th>
								<th>STATUT</th>
								<th>ASSIGNATION</th>
								<th>ACTIONS</th>
							</tr>
						</thead>
						<tbody>
							{filteredVehicles.map((vehicle) => (
								<tr key={vehicle.id}>
									<td className="vehicle-name-cell">{vehicle.name}</td>
									<td className="plate-cell">{vehicle.plate}</td>
									<td>{vehicle.type}</td>
									<td>{vehicle.direction}</td>
									<td className="center-cell">{vehicle.seats}</td>
									<td>{vehicle.fuel}</td>
									<td>{vehicle.lastMaintenance || "—"}</td>
									<td>
										<span className={`status-badge ${vehicle.available ? "status-ok" : "status-busy"}`}>
											{vehicle.available ? "Disponible" : "En mission"}
										</span>
									</td>
									<td className="assignment-cell">
										{!vehicle.available && vehicle.assignedTo ? (
											<div>
												<div className="assigned-name">{vehicle.assignedTo}</div>
												<div className="assigned-date">Jusqu'au {vehicle.assignedUntil}</div>
											</div>
										) : (
											"—"
										)}
									</td>
									<td className="actions-cell">
										<button 
											className="btn-table-edit"
											onClick={() => handleEdit(vehicle)}
											title="Modifier"
										>
											Modifier
										</button>
										<button 
											className="btn-table-delete"
											onClick={() => handleDelete(vehicle.id)}
											title="Supprimer"
										>
											Supprimer
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default Vehicles;
