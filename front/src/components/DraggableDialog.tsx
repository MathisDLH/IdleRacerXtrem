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

export default function DraggableDialog(props:any) {
    const {open, setOpen, title, content} = props;

    const handleClose = (event:any, reason :any) => {
        console.log(event)
        if (reason && reason == "backdropClick")
            return;
        setOpen(false);
    };

    return (
        <div>
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
                        {content}
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}