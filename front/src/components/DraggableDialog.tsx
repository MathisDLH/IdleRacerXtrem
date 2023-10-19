import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';
import "../assets/styles/DraggableDialog.scss"

function PaperComponent(props: PaperProps) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}

type DraggableProps = {
    children?: React.ReactNode,
    open: boolean,
    setOpen: any,
    title: string,
    Content: any
}
export default function DraggableDialog({open,setOpen,title,Content}:DraggableProps) {


    const handleClose = (event:any, reason :any) => {
        console.log(event)
        if (reason && reason == "backdropClick")
            return;
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            hideBackdrop={true}
            className={"dialog"}
        >
            <div className="drag">
                <DialogTitle id="draggable-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    {Content}
                </DialogContent>
            </div>
        </Dialog>
    );
}