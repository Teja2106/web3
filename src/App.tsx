import React, { useMemo, useState } from 'react';
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import {
    WalletActionButton,
    WalletConnectButton,
    WalletDisconnectButton,
    WalletModalProvider,
    WalletSelectButton,
} from '@tronweb3/tronwallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Alert } from '@mui/material';
import { BitKeepAdapter, OkxWalletAdapter, TokenPocketAdapter, TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
import { tronWeb } from './tronweb';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import { Button } from '@tronweb3/tronwallet-adapter-react-ui';
const rows = [
    { name: 'Connect Button', reactUI: WalletConnectButton },
    { name: 'Disconnect Button', reactUI: WalletDisconnectButton },
    { name: 'Select Wallet Button', reactUI: WalletSelectButton },
    { name: 'Multi Action Button', reactUI: WalletActionButton },
];
/**
 * wrap your app content with WalletProvider and WalletModalProvider
 * WalletProvider provide some useful properties and methods
 * WalletModalProvider provide a Modal in which you can select wallet you want use.
 *
 * Also you can provide a onError callback to process any error such as ConnectionError
 */
export function App() {
    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    const adapters = useMemo(function () {
        const tronLinkAdapter = new TronLinkAdapter();
        const walletConnectAdapter = new WalletConnectAdapter({
            network: 'Nile',
            options: {
                relayUrl: 'wss://relay.walletconnect.com',
                // example WC app project ID
                projectId: '5fc507d8fc7ae913fff0b8071c7df231',
                metadata: {
                    name: 'Test DApp',
                    description: 'JustLend WalletConnect',
                    url: 'https://your-dapp-url.org/',
                    icons: ['https://your-dapp-url.org/mainLogo.svg'],
                },
            },
            web3ModalConfig: {
                themeMode: 'dark',
                themeVariables: {
                    '--w3m-z-index': '1000'
                },
            }
        });
        const ledger = new LedgerAdapter({
            accountNumber: 2,
        });
        const bitKeepAdapter = new BitKeepAdapter();
        const tokenPocketAdapter = new TokenPocketAdapter();
        const okxwalletAdapter = new OkxWalletAdapter();
        return [tronLinkAdapter, bitKeepAdapter, tokenPocketAdapter, okxwalletAdapter, walletConnectAdapter, ledger];
    }, []);
    return (
        <WalletProvider onError={onError} autoConnect={true} disableAutoConnectOnLoad={true} adapters={adapters}>
            <WalletModalProvider>
                <UIComponent></UIComponent>
                <Profile></Profile>
                <SignDemo></SignDemo>
            </WalletModalProvider>
        </WalletProvider>
    );
}

function UIComponent() {
    return (
        <div>
            <h2>Global Virtual Water Ledger</h2>
            <TableContainer style={{ overflow: 'visible' }} component="div">
                <Table sx={{  }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell align="left">React UI</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">
                                    <row.reactUI></row.reactUI>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

function Profile() {
    const { address, connected, wallet } = useWallet();
    return (
        <div>
            <h2>Wallet Connection Info</h2>
            <p>
                <span>Connection Status:</span> {connected ? 'Connected' : 'Disconnected'}
            </p>
            <p>
                <span>Your selected Wallet:</span> {wallet?.adapter.name}
            </p>
            <p>
                <span>Your Address:</span> {address}
            </p>
        </div>
    );
}

function SignDemo() {
    const { signMessage, signTransaction, address } = useWallet();
    const [message, setMessage] = useState('');
    const [signedMessage, setSignedMessage] = useState('');
    const receiver = 'TSexdTfC9BfFbBrV8W5CSrrNazSzuHspab';
    const [open, setOpen] = useState(false);

    async function onSignMessage() {
        const res = await signMessage(message);
        setSignedMessage(res);
    }

    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.001), address);

        const signedTransaction = await signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
         await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }
    return (
        <div style={{ marginBottom: 200 }}>
            <h2>Sign a message</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can sign a message by click the button.
            </p>
            <Button style={{ marginRight: '20px' }} onClick={onSignMessage}>
                SignMessage
            </Button>
            <TextField
                size="small"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="input message to signed"
            ></TextField>
            <p>Your sigedMessage is: {signedMessage}</p>
            <h2>Sign a Transaction</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can transfer 0.001 Trx to &nbsp;<i>{receiver}</i>&nbsp;by click the button.
            </p>
            <Button onClick={onSignTransaction}>Transfer</Button>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
        </div>
    );
}
