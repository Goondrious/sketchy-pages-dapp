/* global chrome */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./Login.css";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

import Web3 from "web3";

import pagesIcon from "./sabc.png";

function Pages() {
  const [web3, setWeb3] = useState(false);
  const [publicAddress, setPublicAddress] = useState(false);
  const [ownership, setOwnership] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      window.alert("You need MetaMask to use this app");
      return;
    }

    const newWeb3 = new Web3(window.ethereum);
    // We don't know window.web3 version, so we use our own instance of Web3
    // with the injected provider given by MetaMask
    setWeb3(newWeb3);

    const accounts = await newWeb3.eth.getAccounts();

    if (accounts.length) {
      const address = accounts[0].toLowerCase();
      setPublicAddress(address);

      const contractAddress = "0xaDC28cac9c1d53cC7457b11CC9423903dc09DDDc";
      const miniAbi = [
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256",
            },
          ],
          payable: false,
          type: "function",
        },
      ];
      setLoading(true);
      const contractInstance = new newWeb3.eth.Contract(
        miniAbi,
        contractAddress
      );

      const res = await contractInstance.methods
        .balanceOf(address)
        .call({ from: address }, function (error, result) {
          return result;
        });
      setLoading(false);
      setOwnership(res);
    }
  }, []);

  const handleOnConnectToWeb3 = useCallback(async () => {
    if (web3) {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        window.alert("You need MetaMask to use this app");
        return;
      }

      try {
        await window.ethereum.enable();
      } catch (error) {
        window.alert("You need to allow MetaMask access.");
        return;
      }
    }

    const coinbase = await web3.eth.getCoinbase();
    if (!coinbase) {
      window.alert("Please connect to MetaMask.");
      return;
    }

    const publicAddress = coinbase.toLowerCase();
    setPublicAddress(publicAddress);

    const contractAddress = "0xaDC28cac9c1d53cC7457b11CC9423903dc09DDDc";
    const miniAbi = [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        type: "function",
      },
    ];
    setLoading(true);
    const contractInstance = new web3.eth.Contract(miniAbi, contractAddress);

    const res = await contractInstance.methods
      .balanceOf(publicAddress)
      .call({ from: publicAddress }, function (error, result) {
        return result;
      });
    setLoading(false);
    setOwnership(res);
  }, [window.ethereum, web3]);

  const [loadingPages, setLoadingPages] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [pages, setPages] = useState([]);
  const [walletOfOwner, setWalletOfOwner] = useState([]);

  useEffect(async () => {
    if (ownership && ownership >= 1) {
      setLoadingPages(true);
      // fetch sketchy page data
      const contractAddress = "0xD1c78F094ECe6636Be3b5e73D2e31864dfb5a2E2";
      const miniAbi = [
        {
          constant: true,
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              name: "totalSupply",
              type: "uint256",
            },
          ],
          payable: false,
          type: "function",
        },
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address",
            },
          ],
          name: "walletOfOwner",
          outputs: [
            {
              name: "tokens",
              type: "uint256[]",
            },
          ],
          payable: false,
          type: "function",
        },
        {
          constant: true,
          inputs: [
            {
              name: "_tokenId",
              type: "uint256",
            },
          ],
          name: "readMessage",
          outputs: [
            {
              name: "message",
              type: "string",
            },
          ],
          payable: false,
          type: "function",
        },
      ];

      try {
        const contractInstance = new web3.eth.Contract(
          miniAbi,
          contractAddress
        );

        const totalSupply = await contractInstance.methods
          .totalSupply()
          .call({ from: publicAddress }, function (error, result) {
            return result;
          });
        const walletOfOwner = await contractInstance.methods
          .walletOfOwner(publicAddress)
          .call({ from: publicAddress }, function (error, result) {
            return result;
          });
        const pageData = await Promise.all(
          new Array(totalSupply).fill(0).map(
            (_, i) =>
              new Promise(async (resolve) => {
                const id = i + 1;
                const message = await contractInstance.methods
                  .readMessage(id)
                  .call({ from: publicAddress }, function (error, result) {
                    return result;
                  });
                resolve({ id, message });
              })
          )
        );
        setTotalSupply(totalSupply);
        setWalletOfOwner(walletOfOwner);
        setPages(pageData);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingPages(false);
      }
    }
  }, [ownership, publicAddress, web3]);

  const ownerMessages = useMemo(() => {
    return (
      walletOfOwner.filter((o) => pages.find(({ id }) => id == o)).length > 0
    );
  }, [pages, walletOfOwner]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-evenly",
        overflow: "hidden",
      }}
    >
      {loading && <CircularProgress />}
      {!loading && (
        <Box>
          {!publicAddress && (
            <Button variant="outlined" onClick={handleOnConnectToWeb3}>
              Connect to Web3!
            </Button>
          )}

          {(!ownership || ownership < 1) && <Box>Hodlers Only!</Box>}
          {ownership && ownership >= 1 && (
            <Box>
              <Typography>
                You are the proud owner of {ownership} SABC.
              </Typography>
              <Box>
                <Typography variant="h4">The story thus far...</Typography>
                <Typography variant="caption" component="div">
                  {pages.length} / {totalSupply} pages written
                </Typography>
                <img src={pagesIcon} />
                {loadingPages && <CircularProgress />}
                {walletOfOwner.length === 0 && (
                  <Alert severity="warning">You don't own any pages :(</Alert>
                )}
                {walletOfOwner.length > 0 && !ownerMessages && (
                  <Alert severity="info">
                    You own {walletOfOwner.length} pages, but haven't written
                    anything :(
                  </Alert>
                )}
                {walletOfOwner.length > 0 && ownerMessages && (
                  <Alert severity="success">
                    You've written in these pages: {walletOfOwner.join(", ")}
                  </Alert>
                )}
                {pages.map((o) => (
                  <Typography key={o.id} variant="body1" component="span">
                    {o.message}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Pages;
