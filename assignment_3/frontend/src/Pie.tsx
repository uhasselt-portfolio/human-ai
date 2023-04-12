import { ResponsivePie } from '@nivo/pie'

function Pie(props: any) {
    function format(data: any) {
       
        // multiply all values in data by 100
        // to get a percentage

        // sort the data
        data.sort((a: any, b: any) => {
            return b.total - a.total
        })


        const returnData = data.map((item: any) => {
            return {
                ...item,
                value: item.total * 100,
                label: item.id               
            }
        })

        console.log(returnData)

        return returnData
    }

   return <ResponsivePie
        data={format(props.data)}
        margin={{
            "top": 100,
            "bottom": 50,
        }}

        colors={{ scheme: 'paired' }}
        
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
    />
}

export default Pie;