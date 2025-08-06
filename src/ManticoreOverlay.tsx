import './ManticoreOverlay.css';

export type ManticoreOrb = 'range' | 'mage' | 'melee';

export type ManticoreOverlayProps = {
    order: ManticoreOrb[];
    transparent?: boolean;
}

export const ManticoreOverlay = ({order, transparent = false}: ManticoreOverlayProps) => {
    return <div className={`ManticoreOverlay ${transparent ? 'uncharged' : ''}`}>
        {order.map((orb) => <div key={orb} className={`orb ${orb}`} />)}
    </div>
}