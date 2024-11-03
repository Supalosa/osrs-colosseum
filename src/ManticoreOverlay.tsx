import './ManticoreOverlay.css';

export type ManticoreOrb = 'range' | 'mage' | 'melee';

export type ManticoreOverlayProps = {
    order: ManticoreOrb[];
}

export const ManticoreOverlay = ({order}: ManticoreOverlayProps) => {
    return <div className="ManticoreOverlay">
        {order.map((orb) => <div key={orb} className={`orb ${orb}`} />)}
    </div>
}