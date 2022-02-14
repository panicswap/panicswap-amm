import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import LoadingButton from "../Components/LoadingButton";


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
  }
});

const useStyles = makeStyles(styles);

export default function Rewards() {
  const classes = useStyles();

  return (
    <div>
      <Container>
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            PANIC Rewards
          </Typography>

          <section>
            <Typography variant="h6" className={classes.title}>
              For Farmers:
            </Typography>
            <ul>
              <li>
                PANIC rewards are subject to a 2 year vesting period, but can also be claimed early at a 50% penalty.
              </li>
              <li>
                Exiting before the end of the vesting period always incurs a 50% penalty no matter how early or late you choose to exit.
              </li>
              <li>
                The 50% penalty is distributed continuously to PANIC lockers rewarding the long-term holders.
              </li>
            </ul>
          </section>


          <section>
            <Typography variant="h6" className={classes.title}>
              For PANIC lockers:
            </Typography>
            <ul>
              <li>
                Lock dates are grouped by the week. Any lock between Monday to Sunday is grouped in the same week group, and will release at the same time 2 years later.
              </li>
              <li>
                Locked PANIC is subject to a mandatory 2 years lock and cannot be unlocked early.
              </li>
              <li>
                PANIC rewards from locking PANIC can be claimed anytime with no penalty.
              </li>
            </ul>
          </section>



          <TableContainer>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Claim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {/* Unlocked PANIC */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      Unlocked PANIC
                    </Typography>
                    Staked PANIC and cleared PANIC vests
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>


                {/* PANIC Stake and Lock Rewards */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      PANIC Stake and Lock Rewards
                    </Typography>
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>


                {/* Vesting PANIC */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      Vesting PANIC
                    </Typography>
                    PANIC that can be claimed with a 50% penalty
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>


                {/* Claim all above */}
                <TableRow className={classes.rowClaimAll} >
                  <TableCell component="th" scope="row">
                    Claim all above
                  </TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>


                {/* Unlocked PANIC */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      Unlocked PANIC
                    </Typography>
                    PANIC that was previosuly locked for 2 years
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>

              </TableBody >
            </Table >
          </TableContainer >


        </Paper >


      </Container >


      <Container>
        <Paper className={classes.paperContainer}>

          <Typography variant="h5" className={classes.title}>
            Vesting PANIC
          </Typography>

          <TableContainer>
            <Table className={classes.table} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Early exit penalty</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {/* @todo */}
                {/* @todo --> need to iterate with myArray.map()  */}
                {/* @todo */}
                <TableRow>
                  <TableCell>
                    xxx
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Thu May 12 2022</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    xxx
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Thu May 12 2022</TableCell>
                </TableRow>

              </TableBody >
            </Table >
          </TableContainer >

          <br />

          <Typography variant="body1">
            Total PANIC vesting: xxx
          </Typography>

          <Typography variant="body1">
            Total value: $ xxx
          </Typography>

        </Paper>
      </Container >


      <Container>
        <Paper className={classes.paperContainer}>

          <Typography variant="h5" className={classes.title}>
            Your locked PANIC
          </Typography>

          <TableContainer>
            <Table className={classes.table} size="small" aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {/* @todo */}
                {/* @todo --> need to iterate with myArray.map()  */}
                {/* @todo */}
                <TableRow>
                  <TableCell>
                    xxx
                  </TableCell>
                  <TableCell>Thu May 12 2022</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    xxx
                  </TableCell>
                  <TableCell>Thu May 12 2022</TableCell>
                </TableRow>

              </TableBody >
            </Table >
          </TableContainer >

          <br />

          <Typography variant="body1">
            Total PANIC locked: xxx
          </Typography>

          <Typography variant="body1">
            Total value: $ xxx
          </Typography>

        </Paper>
      </Container >


    </div >
  );
}

