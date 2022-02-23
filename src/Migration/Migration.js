import React, {useEffect} from 'react';
import {getChef, getProvider, getSigner} from '../ethereumFunctions';
import {Button, Container, makeStyles, Paper, Typography} from '@material-ui/core';

const masterChefAddress = "0x668675832fdd9601e8804c694b0e2073b676ceff";

const styles = (theme) => ({
    paperContainer: {
        borderRadius: theme.spacing(2),
        marginBottom: theme.spacing(3),
    },
    title: {
        marginBottom: theme.spacing(1),
    },
    rowClaimAll: {
        backgroundColor: theme.palette.action.hover,
        borderBottom: "3px solid #ccc"
    },
    smallTokenIcon: {
        width: "20px",
        marginLeft: "5px",
        marginRight: "5px",
        marginBottom: "2px",
    }
});
const useStyles = makeStyles(styles);


export default function Migration () {
    const classes = useStyles();

    const [provider, setProvider] = React.useState(getProvider());
    const [signer, setSigner] = React.useState(getSigner(provider));
    const [stakingEps, setStakingEps] = React.useState(getChef(masterChefAddress,signer));
    
    const pools = [
        {
            number: 1,
            name: 'PANIC-WFTM'
        },
        {
            number: 2,
            name: 'yvWFTM-yvDAI'
        },
        {
            number: 3,
            name: 'yvWBTC-yvWETH'
        },
        {
            number: 4,
            name: 'yvYFI-yvWETH'
        },
        {
            number: 5,
            name: 'yvWBTC-renBTC'
        },
        {
            number: 6,
            name: 'yvUSDC-yvDAI'
        }
    ]
    
    const emergencyWithdraw = async (poolNumber) => {
        await stakingEps.emergencyWithdraw(poolNumber);
    }

    return <Container maxWidth="xs">
        <Paper className={classes.paperContainer}>
            <Typography>
                Emergency withdraw from old reward contract:(0x6686..ceff)
            </Typography>
            {pools.map(pool =>
                    <div>
                        <Button variant={'outlined'} key={pool.name} onClick={() => emergencyWithdraw(pool.number)}>
                            {pool.name}
                        </Button>
                    </div>
            )}
            <Typography variable={'body'}>
                After withdraw, you can deposit your LP in the Farms section above
            </Typography>
        </Paper>
    </Container>
    
}
