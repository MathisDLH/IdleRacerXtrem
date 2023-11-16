import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper, { type PaperProps } from '@mui/material/Paper'
import Draggable from 'react-draggable'
import '../assets/styles/DraggableDialog.scss'

function PaperComponent (props: PaperProps): JSX.Element {
  return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
  )
}

interface DraggableProps {
  children?: React.ReactNode
  size: string
  open: boolean
  setOpen: any
  title: string
  icon: any
  Content: any
}
export default function DraggableDialog ({ open, setOpen, title, icon, Content, size }: DraggableProps): JSX.Element {
  const handleClose = (_: any, reason: any): void => {
    if (!(reason !== null && reason === 'backdropClick')) {
      setOpen(false)
    }
  }

  return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            hideBackdrop={true}
            className={'dialog ' + size}
        >
            <div className="drag">
                <DialogTitle id="draggable-dialog-title">
                    <img src={icon} alt="" />
                    <span>{title}</span>
                </DialogTitle>
                <DialogContent id="draggable-dialog-content">
                    {Content}
                </DialogContent>
            </div>
        </Dialog>
  )
}
