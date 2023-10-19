import '../assets/styles/Upgrade.scss';
export default function Upgrade({motor}:any) {

    return(
        <div id={motor.id} className={"upgrade"}>
            {motor.name}
        </div>
    )
}