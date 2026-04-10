import React from 'react'

export function QueueRow({ queue, dimmed }) {
    return (
        <div className={['queue-row', dimmed ? 'complete-dim' : ''].join(' ')}>
            {queue.map((item) => (
                <div
                    key={item.id}
                    className={[
                        'queue-bubble',
                        item.isActive ? 'active' : '',
                        item.isWide ? 'wide' : '',
                        item.isCombo ? 'combo' : '',
                    ].join(' ')}
                    style={{ '--bubble-color': item.color }}
                >
                    {item.label}
                </div>
            ))}
        </div>
    )
}