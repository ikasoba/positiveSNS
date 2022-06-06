import { t } from 'i18next'
import APIClient from '../API/client'
import Button from '../components/button'
import Screen from '../components/Screen'
import TimeLine from '../components/TimeLine'

const client = new APIClient()

export default function Home() {
  return (
    <Screen>
      <div
        className='p-2'
      >
        <h1 className='text-4xl mb-2 border-b-2 border-b-gray-200'>{t("settings.account")}</h1>
        <div className='p-2'>
          {t("settings.delete_account")}<br/>
          <label><input type="checkbox"/>メッセージをすべて削除する</label>
          <Button
            onClick={()=>client.deleteMe()}
            className="m-2"
          >
            {t("button.delete")}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
