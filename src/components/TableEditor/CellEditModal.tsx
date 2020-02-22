import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { CompactPicker } from 'react-color';
import Menu from '@material-ui/core/Menu';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import CellModel, { CellEditModeEnum } from '../../../models/Table/Cell';
import setEditModeAction from '../../redux/actions/editorActions/setEditModeAction';

const useStyles = makeStyles({
  title: {
    textAlign: 'center',
    cursor: 'move'
  },
  openModalBtn: {
    position: 'absolute',
    margin: 0,
    zIndex: 10,
    right: 25,
    padding: 0,
    bottom: 2,
  },
  inputColorIndicator: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: '50%',
    border: '1px solid black'
  },
  colorSelectorMenu: {
    boxShadow: 'none',
    backgroundColor: 'transparent'
  }
});

const DraggableComponent: React.FunctionComponent = props => {
  return (
    <Draggable handle='#draggable-dialog-title' cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

interface OtherPropsInterface {
 cellData: CellModel;
 setContinueShowTools: React.Dispatch<React.SetStateAction<boolean>>
}

type ReduxProps = ConnectedProps<typeof connectToRedux>;

const CellEditModal: React.FunctionComponent<ReduxProps & OtherPropsInterface> = (props) => {

  const { 
    cellData, setEditModeAction, setContinueShowTools
  } = props;

  const { editMode, value, rowIndex, colIndex, valueColor, cellColor } = cellData;

  const classes = useStyles();

  const [localCellDataState, setLocalCellData] = React.useState<CellModel | null>(null);
  const [valueColorMenuState, setValueColorMenu] = React.useState<null | HTMLElement>(null);
  const [cellColorMenuState, setCellColorMenu] = React.useState<null | HTMLElement>(null);
  const [showLoaderState, setShowLoader] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (cellData.editMode === CellEditModeEnum.EDIT_MODE_ON) {
      setLocalCellData(cellData);
    }
  }, [cellData]);

  const inputChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    if (localCellDataState === null) return;
    setLocalCellData({
      ...localCellDataState,
      value: event.target.value
    });
  }

  const valueColorChangeHandler = (color: any): void => {
    if (localCellDataState === null) return;
    setLocalCellData({
      ...localCellDataState,
      valueColor: color.hex
    })
    setValueColorMenu(null);
  }

  const cellColorChangeHandler = (color: any): void => {
    if (localCellDataState === null) return;
    setLocalCellData({
      ...localCellDataState,
      cellColor: color.hex
    })
    setCellColorMenu(null);
  }

  const setEditModeOnHandler = (): void => {
    if(editMode === CellEditModeEnum.EDIT_MODE_OFF) {
      setContinueShowTools(true);
      setShowLoader(true);
      setEditModeAction(cellData);
    }
  }

  const setEditModeOffHandler = (saveData?: boolean): void => {
    if(editMode === CellEditModeEnum.EDIT_MODE_ON && saveData) {
      setEditModeAction({
        ...cellData,
        value: localCellDataState === null ? value : localCellDataState.value.trim(),
        valueColor: localCellDataState === null ? valueColor : localCellDataState.valueColor,
        cellColor: localCellDataState === null ? cellColor : localCellDataState.cellColor
      });
    } else if (editMode === CellEditModeEnum.EDIT_MODE_ON && !saveData) {
      setEditModeAction(cellData);
    }
    setContinueShowTools(false);
  }

  return (
    <React.Fragment>
      <Tooltip title='Edit Cell' arrow>
        <IconButton
          className={classes.openModalBtn}
          onClick={setEditModeOnHandler}
        >
          <EditIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      {localCellDataState === null ?
        <Backdrop open={showLoaderState}>
          <CircularProgress color='inherit' />
        </Backdrop> 
          :
        <Dialog
          open={editMode === CellEditModeEnum.EDIT_MODE_ON}
          onClose={() => setEditModeOffHandler()}
          PaperComponent={DraggableComponent}
          aria-labelledby='draggable-dialog-title'
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle className={classes.title} id='draggable-dialog-title'>
            Edit Cell
          </DialogTitle>
          <DialogContent>
            <TextField 
              label='Cell Value'
              type='text'
              margin='normal'
              variant='outlined'
              fullWidth 
              multiline
              rows='4'
              rowsMax='6'
              onChange={inputChangeHandler}
              value={localCellDataState === null ? 'error' : localCellDataState.value} 
            />
            <Typography component='div' variant='h5'>View options:</Typography>
            <TextField
              label='Text Color'
              type='text'
              margin='normal'
              variant='outlined'
              fullWidth
              disabled
              value={localCellDataState === null ? 'error' : localCellDataState.valueColor}
              InputProps={{
                endAdornment: <div 
                  className={classes.inputColorIndicator} 
                  style={{
                    backgroundColor: localCellDataState === null ? '#000000' : localCellDataState.valueColor
                  }} 
                />
              }}
            />
            <Button
              variant='contained' 
              aria-controls={`change-text-color-menu-${rowIndex}-${colIndex}`}
              aria-haspopup='true'
              disableElevation
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setValueColorMenu(event.currentTarget)}
            >
              Change
            </Button>
            <Menu
              id={`change-text-color-menu-${rowIndex}-${colIndex}`}
              anchorEl={valueColorMenuState}
              keepMounted
              className={classes.colorSelectorMenu}
              open={Boolean(valueColorMenuState)}
              classes={{
                paper: classes.colorSelectorMenu
              }}
              onClose={() => setValueColorMenu(null)}
            >
              <CompactPicker onChangeComplete={valueColorChangeHandler} />
            </Menu>
            <TextField
              label='Cell Color'
              type='text'
              margin='normal'
              variant='outlined'
              fullWidth
              disabled
              value={localCellDataState === null ? 'error' : localCellDataState.cellColor}
              InputProps={{
                endAdornment: <div 
                  className={classes.inputColorIndicator} 
                  style={{
                    backgroundColor: localCellDataState === null ? '#ffffff' : localCellDataState.cellColor
                  }} 
                />
              }}
            />
            <Button
              variant='contained'
              aria-controls={`change-cell-color-menu-${rowIndex}-${colIndex}`}
              aria-haspopup='true'
              disableElevation
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setCellColorMenu(event.currentTarget)}
            >
              Change
            </Button>
            <Menu
              id={`change-cell-color-menu-${rowIndex}-${colIndex}`}
              anchorEl={cellColorMenuState}
              keepMounted
              classes={{
                paper: classes.colorSelectorMenu
              }}
              open={Boolean(cellColorMenuState)}
              onClose={() => setCellColorMenu(null)}
            >
              <CompactPicker onChangeComplete={cellColorChangeHandler} />
            </Menu>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditModeOffHandler()}
              variant='contained'
              color='secondary'
              disableElevation
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setEditModeOffHandler(true)} 
              color='primary'
              variant='contained'
              disableElevation
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      }
    </React.Fragment>
  );
}

const mapActionsToProps = {
  setEditModeAction
};

const connectToRedux = connect(null, mapActionsToProps);  

export default connectToRedux(CellEditModal);