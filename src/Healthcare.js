

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Healthcare = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [patientID, setPatientID] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);
    const [providerAddress, setProviderAddress] = useState('');

    const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B";
    const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "patientID",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "patientName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "diagnosis",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "treatment",
				"type": "string"
			}
		],
		"name": "addRecord",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "provider",
				"type": "address"
			}
		],
		"name": "authorizeProvider",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "patientID",
				"type": "uint256"
			}
		],
		"name": "getPatientRecords",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "recordID",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "patientName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "diagnosis",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "treatment",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct HealthcareRecords.Record[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    useEffect(() => {
        const connectWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    await provider.send('eth_requestAccounts', []);
                    const signer = provider.getSigner();
                    setProvider(provider);
                    setSigner(signer);

                    const accountAddress = await signer.getAddress();
                    setAccount(accountAddress);

                    const contract = new ethers.Contract(contractAddress, contractABI, signer);
                    setContract(contract);

                    const ownerAddress = await contract.getOwner();
                    setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
                } catch (error) {
                    console.error("Error connecting to wallet: ", error);
                }
            } else {
                alert('Please install MetaMask or another Ethereum wallet extension to connect.');
            }
        };
        connectWallet();
    }, []);

    const fetchPatientRecords = async () => {
        try {
            if (!patientID || isNaN(patientID)) {
                alert("Please enter a valid Patient ID.");
                return;
            }

            const records = await contract.getPatientRecords(ethers.BigNumber.from(patientID));
            console.log("Fetched Records:", records); 

            const formattedRecords = records.map(record => ({
                recordID: record.recordID.toNumber(),
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString()
            }));

            console.log("Formatted Records:", formattedRecords);  

            setPatientRecords(formattedRecords);  
        } catch (error) {
            console.error("Error fetching patient records", error);
        }
    };

    const addRecord = async () => {
        try {
            if (!patientID || isNaN(patientID)) {
                alert("Please enter a valid Patient ID.");
                return;
            }

            const tx = await contract.addRecord(
                ethers.BigNumber.from(patientID),
                "Alice",
                diagnosis,
                treatment
            );
            await tx.wait();
            alert("Record added successfully.");
            await fetchPatientRecords();  
        } catch (error) {
            console.error("Error adding records", error);
        }
    };

    const authorizeProvider = async () => {
        if (isOwner) {
            try {
                const tx = await contract.authorizeProvider(providerAddress);
                await tx.wait();
                alert(`Provider ${providerAddress} authorized successfully`);
            } catch (error) {
                console.error("Error authorizing provider", error);
            }
        } else {
            alert("Only the contract owner can authorize providers.");
        }
    };

    return (
        <div className='container'>
            <h1 className="title">Healthcare Application</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className='form-section'>
                <h2> Add Patient ID Records</h2>
                <input
                    className='input-field'
                    type='text'
                    placeholder='Enter Patient ID'
                    value={patientID}
                    onChange={(e) => setPatientID(e.target.value)}
                />
            </div>

            <div className="form-section">
                <h2>Add Patient Record</h2>
                <input
                    className='input-field'
                    type='text'
                    placeholder='Diagnosis'
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                />
                <input
                    className='input-field'
                    type='text'
                    placeholder='Treatment'
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                />
                <button className='action-button' onClick={addRecord}>Add Record</button>
            </div>

            

            {/* <div className='records-section'>
                
            </div> */}
        </div>
    );
};

export default Healthcare;
