const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
}

const starContainerStyle = {
    display: 'flex',
    gap: '4px'
}

const textStyle = {
    lineHeight: "0",
    margin: '1',
}

export default function StarRating({maxRating = 10}) {
    return (
        <div style={containerStyle}>
            <div style={starContainerStyle}>
                {Array.from({length: maxRating}, (_, index) => (
                    <span key={index}>{index + 1}</span>
                ))}
            </div>
            <p style={textStyle}>10</p>
        </div>
    );
}