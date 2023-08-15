import Setting from '../Models/Settings.js';


const read = async (req, res) => {
    try{
        const setting = await Setting.findOne().sort({ _id : -1 })
        if(setting == null){
            try {
                let stg = await Setting.insertMany([
                    {
                        "maincolor": "#000C6E",
                        "secondarycolor": "#4F9CC9",
                        "textcolor": "#f1f6f8",
                        "favicon": "favicon.png",
                        "logo": "logo.png",
                        "latitude": 30.39661031502661,
                        "longitude": -8.099445625
                    },
                    {
                        "maincolor": "#000C6E",
                        "secondarycolor": "#4F9CC9",
                        "textcolor": "#f1f6f8",
                        "favicon": "favicon.png",
                        "logo": "logo.png",
                        "latitude": 30.39661031502661,
                        "longitude": -8.099445625
                    }
                ])
                res.json(stg)
            }catch(err){
                res.status(500).json({error: err.message})
            }
        }
        
        res.status(200).json(setting)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}


const create = async (req, res) => {
    try {
        let setting = {
            ...req.body
        }
        let stg = await Setting.findOneAndUpdate({}, {$set: setting }, { new: true, sort: { _id: -1 }})
        stg = await stg.save();
        await read(req, res)
    }catch(err){
        console.log(err)
        res.status(500).json({error: err.message})
    }
}

export { read, create }