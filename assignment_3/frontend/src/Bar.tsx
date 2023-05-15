import { ResponsiveBar } from '@nivo/bar'

function Bar(props: any) {

    function format(data: any) {
        // sort the data
        data.sort((a: any, b: any) => {
            return a.total - b.total
        })

        return data
    }

   return <ResponsiveBar
        data={format(props.data)} 
        
        keys={["total"]}
        indexBy="id"

        margin={{
            "top": 50,
            "right": 80,
            "bottom": 50,
            "left": 80
        }}

        padding={0.3}

        valueScale={{
            "type": "linear"
        }}

        indexScale={{
            "type": "band",
            "round": true
        }}
        
        axisTop={null}
        axisRight={null}
        axisBottom={{
            "tickSize": 5,
            "tickPadding": 5,
            "tickRotation": 0,
            "legend": "Cause of death",
            "legendPosition": "middle",
            "legendOffset": 32
        }}
        axisLeft={{
            "tickSize": 5,
            "tickPadding": 5,
            "tickRotation": 0,
            "legend": "Chance of death in %",
            "legendPosition": "middle",
            "legendOffset": -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="inherit:darker(1.6)"
       
        animate={true}
    />
}

export default Bar;