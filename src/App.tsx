import React from 'react';
import './App.css';
import {Button, Container, Grid, TextField} from "@mui/material";
import {Contract, errors, ethers} from "ethers";
import {TransactionResponse, TransactionReceipt} from "@ethersproject/abstract-provider"

import abi from "./abi.json"

const contractAddress = "0xeCF59bACcb1d2fd3906eC7063834aCC3E8bFDca2";
// @ts-ignore
const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner();
const contract: Contract = new ethers.Contract(contractAddress, abi, signer);

class App extends React.Component<any, any> {
    state = {
        signerAddr: "",

        mintStr: "",

        transferAddress: "",
        transferTokenId: "",
        transferStr: "",

        ownerOfTokenId: "",
        ownerOfStr: ""
    }

    connect = async () => {
        await provider.send("eth_requestAccounts", [])
        this.setState({signerAddr: await signer.getAddress()})
    }

    mint = async () => {
        contract.mint({
            gasPrice: "250000000000",
        }).then((tr: TransactionResponse) => {
            console.log(`TransactionResponse TX hash: ${tr.hash}`)
            tr.wait().then((receipt: TransactionReceipt) => {
                console.log("receipt", receipt)
                const tokenId = Number(receipt.logs[0].topics[3])
                console.log("tokenId", Number(receipt.logs[0].topics[3]))

                this.setState({mintStr: "Mint Successfully: " + tokenId})
            })
        }).catch((e: errors) => {
            console.log(e)
            this.setState({mintStr: "Mint Error"})
        })
    }

    transfer = async () => {
        if (this.state.transferTokenId && !isNaN(Number(this.state.transferTokenId)) && this.state.transferAddress && this.state.signerAddr) {
            contract.transferFrom(
                this.state.signerAddr,
                this.state.transferAddress,
                this.state.transferTokenId,
                {
                    gasPrice: "250000000000",
                })
                .then((tr: TransactionResponse) => {
                    console.log(`TransactionResponse TX hash: ${tr.hash}`)
                    tr.wait().then((receipt: TransactionReceipt) => {
                        this.setState({transferStr: "Transfer Successfully"})
                    })
                })
                .catch((e: Error) => {
                    console.log(e)
                    this.setState({transferStr: "Transfer Error"})
                })
        } else {
            this.setState({transferStr: "Transfer Error"})
        }
    }

    ownerOf = async () => {
        if (this.state.ownerOfTokenId && !isNaN(Number(this.state.ownerOfTokenId))) {
            const res = await contract.ownerOf(this.state.ownerOfTokenId);
            this.setState({ownerOfStr: "Owner(" + this.state.ownerOfTokenId + "): " + res})
        } else {
            this.setState({ownerOfStr: "invalid TokenId"})
        }
    }


    render() {
        return <Container>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Button size={"large"} variant={"outlined"} onClick={this.connect}>Connect Wallet</Button>
                </Grid>
                <Grid item xs={12}>
                    {this.state.signerAddr ? "Connected Address: " + this.state.signerAddr : ""}
                </Grid>
            </Grid>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Button size={"large"} variant={"outlined"} onClick={this.mint}>Mint</Button>
                </Grid>
                <Grid item xs={12}>
                    <span>{this.state.mintStr}</span>
                </Grid>
            </Grid>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <Button size={"large"} variant={"outlined"} onClick={this.transfer}>Transfer</Button>
                </Grid>
                <Grid item xs={6}>
                    <TextField fullWidth size="small" id="standard-basic" label="to address" variant="standard"
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                   this.setState({transferAddress: event.target.value})
                               }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField id="standard-basic" size="small" label="tokenId" variant="standard"
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                   this.setState({transferTokenId: event.target.value})
                               }}
                    />
                </Grid>
                <Grid item xs={8}>
                    {this.state.transferStr}
                </Grid>
            </Grid>
            <br/>
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <Button size={"large"} variant={"outlined"} onClick={this.ownerOf}>OwnerOf</Button>
                </Grid>
                <Grid item xs={10}>
                    <TextField id="standard-basic" size="small" label="tokenId" variant="standard"
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                   this.setState({ownerOfTokenId: event.target.value})
                               }}
                    />
                </Grid>
                <Grid item xs={8}>
                    <span>{this.state.ownerOfStr}</span>
                </Grid>
            </Grid>
        </Container>
    }
}

export default App;
